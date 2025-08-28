import type { Pet, PetState } from '$lib/types/Pet.js';
import { GAME_CONFIG } from '$lib/config/gameConfig.js';

export class GameEngine {
  static updatePetStats(pet: Pet): Pet {
    const timeDiff = Date.now() - pet.lastUpdate.getTime();
    const updates = Math.floor(timeDiff / GAME_CONFIG.UPDATE_INTERVAL);
    
    if (updates === 0) return pet;
    
    const newPet = { ...pet };
    
    // Naturalny spadek statystyk
    newPet.hunger = Math.max(0, pet.hunger - (GAME_CONFIG.DECAY_RATES.HUNGER * updates));
    newPet.happiness = Math.max(0, pet.happiness - (GAME_CONFIG.DECAY_RATES.HAPPINESS * updates));
    newPet.energy = Math.max(0, pet.energy - (GAME_CONFIG.DECAY_RATES.ENERGY * updates));
    
    // Wpływ na zdrowie
    if (newPet.hunger < 10 || newPet.happiness < 10) {
      newPet.health = Math.max(0, newPet.health - 2);
    }
    
    // Aktualizacja wieku
    newPet.age += updates * (GAME_CONFIG.UPDATE_INTERVAL / (1000 * 60 * 60)); // w godzinach
    
    newPet.lastUpdate = new Date();
    newPet.state = this.calculateState(newPet);
    
    return newPet;
  }

  static feedPet(pet: Pet): Pet {
    const effects = GAME_CONFIG.ACTION_EFFECTS.FEED;
    return {
      ...pet,
      hunger: Math.min(100, pet.hunger + effects.hunger),
      happiness: Math.min(100, pet.happiness + effects.happiness),
      state: this.calculateState({
        ...pet,
        hunger: Math.min(100, pet.hunger + effects.hunger),
        happiness: Math.min(100, pet.happiness + effects.happiness),
      })
    };
  }

  static playWithPet(pet: Pet): Pet {
    if (pet.energy < 10) return pet; // Za mało energii
    
    const effects = GAME_CONFIG.ACTION_EFFECTS.PLAY;
    return {
      ...pet,
      happiness: Math.min(100, pet.happiness + effects.happiness),
      energy: Math.max(0, pet.energy + effects.energy),
      hunger: Math.max(0, pet.hunger + effects.hunger),
      state: 'playing'
    };
  }

  static putPetToSleep(pet: Pet): Pet {
    const effects = GAME_CONFIG.ACTION_EFFECTS.SLEEP;
    return {
      ...pet,
      energy: Math.min(100, pet.energy + effects.energy),
      hunger: Math.max(0, pet.hunger + effects.hunger),
      state: 'sleeping'
    };
  }

  static calculateState(pet: Pet): PetState {
    if (pet.health <= 0) return 'dead';
    if (pet.health < GAME_CONFIG.CRITICAL_LEVELS.HEALTH) return 'sick';
    if (pet.energy < GAME_CONFIG.CRITICAL_LEVELS.ENERGY) return 'sleeping';
    if (pet.hunger < GAME_CONFIG.CRITICAL_LEVELS.HUNGER) return 'hungry';
    return 'happy';
  }
}
