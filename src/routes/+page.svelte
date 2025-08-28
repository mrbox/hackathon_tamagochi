<script lang="ts">
  import { onMount } from 'svelte';
  import { feedPet, playWithPet, putToSleep, performVibeCheck, updatePetState, resetGame, isGameOver } from '$lib/logic/gameEngine';
  import type { Pet } from '$lib/models/Pet';
  import type { Achievement } from '$lib/models/Achievements';
  import { checkAchievements } from '$lib/models/Achievements';
  import { savePetState, loadPetState, saveGameStats, loadGameStats } from '$lib/utils/storage';
  import { playFeedSound, playPlaySound, playSleepSound, playLevelUpSound, playAchievementSound, playDeathSound } from '$lib/utils/sounds';
  import Screen from '$lib/components/Screen.svelte';
  import Buttons from '$lib/components/Buttons.svelte';
  import Achievements from '$lib/components/Achievements.svelte';
  import { tamagotchiAIService } from '$lib/services/tamagotchiAIService';
  import VibeCheckModal from '$lib/components/VibeCheckModal.svelte';

  // Stan zwierzaka (reaktywny w Svelte)
  let pet: Pet = {
    hunger: 20, // Zaczyna z lekkim głodem
    happiness: 100,
    health: 100,
    state: 'happy',
    age: 0,
    stage: 'baby',
    experience: 0,
    level: 1,
    totalInteractions: 0,
    lastInteraction: Date.now(),
    createdAt: Date.now(),
    vibeLevel: 50,
    coins: 100, // startowa waluta
    activeEffects: []
  };

  let gameOver = false;
  let gameInterval: number;
  let aiInterval: number;
  let achievements: Achievement[] = [];
  let showAchievements = false;
  let showVibeCheck = false;
  let gameStats = loadGameStats();
  let previousLevel = 1;
  let currentAIMessage = '';
  let lastAIUpdate = 0;

  // Funkcje obsługi przycisków
  const handlePlay = () => {
    pet = playWithPet(pet);
    gameOver = isGameOver(pet);
    playPlaySound();
    savePetState(pet);
    checkLevelUp();
    updateAchievements();
  };

  const handleEat = () => {
    pet = feedPet(pet);
    gameOver = isGameOver(pet);
    playFeedSound();
    savePetState(pet);
    checkLevelUp();
    updateAchievements();
  };

  const handleSleep = () => {
    pet = putToSleep(pet);
    gameOver = isGameOver(pet);
    playSleepSound();
    savePetState(pet);
    checkLevelUp();
    updateAchievements();
  };

  const handleReset = () => {
    pet = resetGame();
    gameOver = false;
    previousLevel = 1;
    gameStats.petsRaised++;
    saveGameStats(gameStats);
    savePetState(pet);
    updateAchievements();
  };

  const handleShowAchievements = () => {
    showAchievements = true;
  };

  const handleShowVibeCheck = () => {
    showVibeCheck = true;
  };

  const handleVibeCheck = (emoji: string) => {
    pet = performVibeCheck(pet, emoji);
    gameOver = isGameOver(pet);
    savePetState(pet);
    checkLevelUp();
    updateAchievements();
  };

  const checkLevelUp = () => {
    if (pet.level > previousLevel) {
      playLevelUpSound();
      previousLevel = pet.level;
    }
  };

  const updateAchievements = () => {
    const stats = {
      totalInteractions: pet.totalInteractions,
      petsRaised: gameStats.petsRaised,
      maxAge: pet.age,
      currentStage: pet.stage,
      perfectCareHours: 0 // TODO: implement
    };
    
    const newAchievements = checkAchievements(stats, achievements);
    const newlyUnlocked = newAchievements.filter(a => 
      a.unlocked && !achievements.find(old => old.id === a.id && old.unlocked)
    );
    
    if (newlyUnlocked.length > 0) {
      playAchievementSound();
    }
    
    achievements = newAchievements;
  };

  // Pętla gry - aktualizuje stan zwierzaka co 3 sekundy
  onMount(() => {
    // Wczytaj zapisany stan
    const savedPet = loadPetState();
    if (savedPet) {
      pet = savedPet;
      gameOver = isGameOver(pet);
      previousLevel = pet.level;
    }
    
    // Inicjalizuj osiągnięcia
    updateAchievements();
    
    gameInterval = setInterval(() => {
      if (!gameOver) {
        pet = updatePetState(pet);
        gameOver = isGameOver(pet);
        
        if (gameOver) {
          playDeathSound();
        }
        
        savePetState(pet);
        checkLevelUp();
        updateAchievements();
      }
    }, 4000);

    // AI messaging interval - every 30 seconds
    aiInterval = setInterval(async () => {
      if (!gameOver) {
        try {
          const response = await tamagotchiAIService.getPetResponse(pet);
          currentAIMessage = response.message;
          lastAIUpdate = Date.now();
        } catch (error) {
          console.error('Failed to get AI message:', error);
        }
      }
    }, 30000);

    // Get initial AI message
    tamagotchiAIService.getPetResponse(pet).then(response => {
      currentAIMessage = response.message;
      lastAIUpdate = Date.now();
    }).catch(error => {
      console.error('Failed to get initial AI message:', error);
    });

    return () => {
      if (gameInterval) {
        clearInterval(gameInterval);
      }
      if (aiInterval) {
        clearInterval(aiInterval);
      }
    };
  });
</script>

<svelte:head>
  <title>Tamagotchi AI - Digital Pet</title>
</svelte:head>

<div class="tamagotchi-app">
  <div class="app-header">
    <h1>🐾 TAMAGOTCHI AI</h1>
    <p>Digital Pet Companion</p>
  </div>
  
  <div class="game-container">
    <div class="game-header">
      <div class="pet-info">
        <div class="pet-level">Poziom {pet.level}</div>
        <div class="pet-stage">{pet.stage === 'baby' ? 'Dziecko' : 
                                pet.stage === 'teen' ? 'Nastolatek' : 
                                pet.stage === 'adult' ? 'Dorosły' : 
                                pet.stage === 'elder' ? 'Starszy' : 'Jajko'}</div>
        <div class="pet-age">Wiek: {pet.age} dni</div>
      </div>
      <button class="achievements-button" on:click={handleShowAchievements}>
        🏆 Osiągnięcia
      </button>
    </div>
    
    <Screen {pet} />
    
    {#if currentAIMessage}
      <div class="ai-message-container">
        <div class="ai-message">
          <div class="message-header">💭 Twój zwierzak mówi:</div>
          <div class="message-content">{currentAIMessage}</div>
        </div>
      </div>
    {/if}
    <Buttons 
      onPlay={handlePlay}
      onEat={handleEat}
      onSleep={handleSleep}
      onReset={handleReset}
      onVibeCheck={handleShowVibeCheck}
      isGameOver={gameOver}
    />
  </div>
  
  <Achievements {achievements} show={showAchievements} />
  <VibeCheckModal show={showVibeCheck} onVibeCheck={handleVibeCheck} />
  
  <div class="app-footer">
    <p>Opiekuj się swoim zwierzakiem! 🎮</p>
  </div>
</div>

<style>
  .tamagotchi-app {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'Courier New', monospace;
    color: white;
  }
  
  .app-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .app-header h1 {
    font-size: 32px;
    margin: 0 0 10px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient 3s ease infinite;
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .app-header p {
    font-size: 16px;
    margin: 0;
    opacity: 0.8;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
  
  .game-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }
  
  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 420px;
    padding: 15px;
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    border: 2px solid #6b7280;
    border-radius: 8px;
  }
  
  .pet-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .pet-level {
    color: #10b981;
    font-weight: bold;
    font-size: 16px;
  }
  
  .pet-stage {
    color: #f59e0b;
    font-size: 14px;
  }
  
  .pet-age {
    color: #6b7280;
    font-size: 12px;
  }
  
  .achievements-button {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    border: 2px solid #a78bfa;
    color: white;
    padding: 10px 15px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .achievements-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
  }
  
  .app-footer {
    text-align: center;
    margin-top: 30px;
    opacity: 0.6;
    font-size: 14px;
  }
  
  .app-footer p {
    margin: 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  .ai-message-container {
    width: 420px;
    margin: 10px 0;
  }

  .ai-message {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    border: 2px solid #60a5fa;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    animation: messageAppear 0.5s ease-out;
  }

  .message-header {
    font-size: 12px;
    color: #bfdbfe;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .message-content {
    font-size: 14px;
    color: white;
    line-height: 1.4;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  @keyframes messageAppear {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
