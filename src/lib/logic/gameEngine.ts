import type { Pet } from '$lib/models/Pet';

// Funkcja karmienia zwierzaka
export const feedPet = (pet: Pet): Pet => {
  if (pet.state === 'dead') return pet;
  
  return {
    ...pet,
    hunger: Math.max(0, pet.hunger - 30),
    happiness: Math.min(100, pet.happiness + 10),
    health: Math.min(100, pet.health + 5),
    state: pet.hunger <= 30 ? 'full' : 'happy',
    totalInteractions: pet.totalInteractions + 1,
    lastInteraction: Date.now(),
    experience: pet.experience + 5
  };
};

// Funkcja zabawy ze zwierzakiem
export const playWithPet = (pet: Pet): Pet => {
  if (pet.state === 'dead' || pet.state === 'sleeping') return pet;
  
  return {
    ...pet,
    happiness: Math.min(100, pet.happiness + 25),
    hunger: Math.min(100, pet.hunger + 10),
    health: Math.min(100, pet.health + 2),
    state: 'happy',
    totalInteractions: pet.totalInteractions + 1,
    lastInteraction: Date.now(),
    experience: pet.experience + 10
  };
};

// Funkcja usypiania zwierzaka
export const putToSleep = (pet: Pet): Pet => {
  if (pet.state === 'dead') return pet;
  
  return {
    ...pet,
    health: Math.min(100, pet.health + 15),
    happiness: Math.max(0, pet.happiness - 5),
    state: 'sleeping',
    totalInteractions: pet.totalInteractions + 1,
    lastInteraction: Date.now(),
    experience: pet.experience + 3
  };
};

// Funkcja aktualizacji stanu zwierzaka (wywoływana cyklicznie)
export const updatePetState = (pet: Pet): Pet => {
  if (pet.state === 'dead') return pet;
  
  // Zwiększ głód
  const newHunger = Math.min(100, pet.hunger + 5);
  
  // Zmniejsz szczęście jeśli głodny
  const newHappiness = newHunger > 70 ? Math.max(0, pet.happiness - 3) : pet.happiness;
  
  // Zmniejsz zdrowie jeśli bardzo głodny lub nieszczęśliwy
  const newHealth = (newHunger > 90 || newHappiness < 20) 
    ? Math.max(0, pet.health - 2) 
    : pet.health;
  
  // Określ nowy stan
  let newState: Pet['state'] = pet.state;
  if (newHealth <= 0) {
    newState = 'dead';
  } else if (newHunger > 80) {
    newState = 'hungry';
  } else if (newHappiness > 80 && newHunger < 50) {
    newState = 'happy';
  } else if (pet.state === 'sleeping') {
    newState = 'happy'; // Obudź się po śnie
  }
  
  // Oblicz nowy wiek (w dniach)
  const now = Date.now();
  const ageInDays = Math.floor((now - pet.createdAt) / (1000 * 60 * 60 * 24));
  
  // Oblicz nowy poziom na podstawie doświadczenia
  const newLevel = Math.floor(pet.experience / 100) + 1;
  
  // Określ etap ewolucji
  let newStage = pet.stage;
  if (ageInDays >= 7 && pet.stage === 'baby') {
    newStage = 'teen';
  } else if (ageInDays >= 14 && pet.stage === 'teen') {
    newStage = 'adult';
  } else if (ageInDays >= 30 && pet.stage === 'adult') {
    newStage = 'elder';
  }
  
  return {
    ...pet,
    hunger: newHunger,
    happiness: newHappiness,
    health: newHealth,
    state: newState,
    age: ageInDays,
    level: newLevel,
    stage: newStage
  };
};

// Funkcja sprawdzania czy gra się skończyła
export const isGameOver = (pet: Pet): boolean => {
  return pet.state === 'dead';
};

// Funkcja resetowania gry
export const resetGame = (): Pet => {
  return {
    hunger: 0,
    happiness: 100,
    health: 100,
    state: 'happy',
    age: 0,
    stage: 'baby',
    experience: 0,
    level: 1,
    totalInteractions: 0,
    lastInteraction: Date.now(),
    createdAt: Date.now()
  };
};
