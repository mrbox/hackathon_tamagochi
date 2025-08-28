export interface Pet {
  hunger: number;
  happiness: number;
  health: number;
  state: 'happy' | 'hungry' | 'sleeping' | 'dead' | 'full';
  // System ewolucji
  age: number; // wiek w dniach
  stage: 'egg' | 'baby' | 'teen' | 'adult' | 'elder';
  experience: number; // punkty doświadczenia
  level: number; // poziom zwierzaka
  // Dodatkowe statystyki
  totalInteractions: number;
  lastInteraction: number;
  createdAt: number;
}

// Typy akcji dla zwierzaka
export type PetAction = 'feed' | 'play' | 'sleep';

// Stan gry
export interface GameState {
  pet: Pet;
  isGameOver: boolean;
  score: number;
}
