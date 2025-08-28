import { azureOpenAIService, type ChatMessage } from './azureOpenAIService.js';
import type { Pet, PetState } from '../types/Pet.js';

export interface PetResponse {
  message: string;
  suggestion?: string;
}

export class TamagotchiAIService {
  
  /**
   * Generate AI response based on pet's current state
   */
  async getPetResponse(pet: Pet, userMessage?: string): Promise<PetResponse> {
    if (!azureOpenAIService.isConfigured()) {
      return {
        message: this.getFallbackResponse(pet.state),
        suggestion: "Configure Azure OpenAI to enable AI interactions!"
      };
    }

    try {
      const systemMessage = this.buildSystemMessage(pet);
      const messages: ChatMessage[] = [
        { role: 'system', content: systemMessage }
      ];

      if (userMessage) {
        messages.push({ role: 'user', content: userMessage });
      } else {
        messages.push({ role: 'user', content: 'How are you feeling right now?' });
      }

      const response = await azureOpenAIService.chatCompletion(messages, {
        maxTokens: 150,
        temperature: 0.8
      });

      return {
        message: response.content,
        suggestion: this.getSuggestion(pet)
      };
    } catch (error) {
      console.error('Failed to get AI response:', error);
      return {
        message: this.getFallbackResponse(pet.state),
        suggestion: "AI service temporarily unavailable"
      };
    }
  }

  /**
   * Generate pet name suggestions based on characteristics
   */
  async generatePetName(characteristics?: string): Promise<string[]> {
    if (!azureOpenAIService.isConfigured()) {
      return ['Buddy', 'Pixel', 'Mochi', 'Luna', 'Ziggy'];
    }

    try {
      const prompt = `Generate 5 creative and cute pet names for a virtual Tamagotchi pet${characteristics ? ` that is ${characteristics}` : ''}. Return only the names, one per line.`;
      
      const response = await azureOpenAIService.generateText(prompt, undefined, {
        maxTokens: 100,
        temperature: 0.9
      });

      return response.split('\n')
        .map(name => name.trim().replace(/^\d+\.?\s*/, ''))
        .filter(name => name.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to generate pet names:', error);
      return ['Buddy', 'Pixel', 'Mochi', 'Luna', 'Ziggy'];
    }
  }

  /**
   * Get personalized care advice
   */
  async getCareAdvice(pet: Pet): Promise<string> {
    if (!azureOpenAIService.isConfigured()) {
      return this.getFallbackAdvice(pet);
    }

    try {
      const prompt = `My virtual pet has these stats: Hunger: ${pet.hunger}%, Happiness: ${pet.happiness}%, Energy: ${pet.energy}%, Health: ${pet.health}%, Age: ${pet.age} days. Current state: ${pet.state}. Give me brief, caring advice on how to take better care of my pet.`;
      
      return await azureOpenAIService.generateText(
        prompt,
        "You are a caring virtual pet expert. Provide warm, helpful advice in 1-2 sentences.",
        { maxTokens: 100, temperature: 0.7 }
      );
    } catch (error) {
      console.error('Failed to get care advice:', error);
      return this.getFallbackAdvice(pet);
    }
  }

  private buildSystemMessage(pet: Pet): string {
    return `You are a virtual Tamagotchi pet that communicates through cute, expressive messages. 

Current stats:
- Hunger: ${pet.hunger}%
- Happiness: ${pet.happiness}%
- Energy: ${pet.energy}%
- Health: ${pet.health}%
- Age: ${pet.age} days
- State: ${pet.state}

Respond as this pet would, showing personality based on your current state. Keep responses short (1-2 sentences), cute, and expressive. Use emojis appropriately. If you're happy, be playful. If hungry, mention food. If tired, be sleepy. If sick, be a bit sad but still endearing.`;
  }

  private getFallbackResponse(state: PetState): string {
    const responses = {
      happy: "I'm feeling great! 😊 Let's play together!",
      hungry: "I'm so hungry... 🍎 Could you feed me please?",
      sleeping: "Zzz... 😴 I'm having sweet dreams!",
      playing: "This is so much fun! 🎮 I love playing with you!",
      sick: "I don't feel very well... 🤒 Maybe I need some rest?",
      dead: "💫 I'll always remember our time together..."
    };
    return responses[state] || "Hello! I'm your virtual pet! 🐾";
  }

  private getSuggestion(pet: Pet): string {
    if (pet.hunger < 30) return "Your pet is hungry! Try feeding them.";
    if (pet.happiness < 30) return "Your pet seems sad. Try playing with them!";
    if (pet.energy < 20) return "Your pet is tired. Let them sleep.";
    if (pet.health < 50) return "Your pet's health is low. Make sure they're well-fed and rested.";
    return "Your pet is doing well! Keep up the good care!";
  }

  private getFallbackAdvice(pet: Pet): string {
    if (pet.state === 'hungry') return "Your pet is hungry! Feed them to restore their energy and happiness.";
    if (pet.state === 'sick') return "Your pet needs rest and care. Make sure they're well-fed and get enough sleep.";
    if (pet.happiness < 50) return "Try playing with your pet more often to boost their happiness!";
    return "Keep maintaining a good balance of feeding, playing, and rest for your pet.";
  }
}

export const tamagotchiAIService = new TamagotchiAIService();
