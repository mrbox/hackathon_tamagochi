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
        suggestion: "Skonfiguruj Azure OpenAI, aby włączyć interakcje AI!"
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
        messages.push({ role: 'user', content: 'Jak się teraz czujesz?' });
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
        suggestion: "Usługa AI tymczasowo niedostępna"
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

Respond as this pet would, showing personality based on your current state. Keep responses short (1-2 sentences), cute, and expressive. Use emojis appropriately. If you're happy, be playful. If hungry, mention food. If tired, be sleepy. If sick, be a bit sad but still endearing.

IMPORTANT: Always respond in Polish language only.`;
  }

  private getFallbackResponse(state: PetState): string {
    const responses = {
      happy: "Czuję się świetnie! 😊 Zabawmy się razem!",
      hungry: "Jestem taki głodny... 🍎 Czy możesz mnie nakarmić?",
      sleeping: "Zzz... 😴 Śnią mi się słodkie sny!",
      playing: "To takie zabawne! 🎮 Uwielbiam się z tobą bawić!",
      sick: "Nie czuję się zbyt dobrze... 🤒 Może potrzebuję odpoczynku?",
      dead: "💫 Na zawsze zapamiętam nasz wspólny czas..."
    };
    return responses[state] || "Cześć! Jestem twoim wirtualnym zwierzątkiem! 🐾";
  }

  private getSuggestion(pet: Pet): string {
    if (pet.hunger < 30) return "Twoje zwierzątko jest głodne! Spróbuj je nakarmić.";
    if (pet.happiness < 30) return "Twoje zwierzątko wydaje się smutne. Pobaw się z nim!";
    if (pet.energy < 20) return "Twoje zwierzątko jest zmęczone. Pozwól mu się przespać.";
    if (pet.health < 50) return "Zdrowie twojego zwierzątka jest niskie. Upewnij się, że jest najedzone i wypoczęte.";
    return "Twoje zwierzątko ma się dobrze! Kontynuuj dobrą opiekę!";
  }

  private getFallbackAdvice(pet: Pet): string {
    if (pet.state === 'hungry') return "Twoje zwierzątko jest głodne! Nakarm je, aby przywrócić jego energię i szczęście.";
    if (pet.state === 'sick') return "Twoje zwierzątko potrzebuje odpoczynku i opieki. Upewnij się, że jest najedzone i ma wystarczająco snu.";
    if (pet.happiness < 50) return "Spróbuj częściej bawić się ze swoim zwierzątkiem, aby podnieść jego szczęście!";
    return "Kontynuuj utrzymywanie dobrej równowagi między karmieniem, zabawą i odpoczynkiem dla swojego zwierzątka.";
  }
}

export const tamagotchiAIService = new TamagotchiAIService();
