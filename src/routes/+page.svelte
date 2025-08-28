<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { GameEngine } from '$lib/logic/gameEngine.js';
  import { StorageService } from '$lib/services/storageService.js';
  import Screen from '$lib/components/Screen.svelte';
  import StatusBars from '$lib/components/StatusBars.svelte';
  import type { Pet } from '$lib/types/Pet.js';

  let pet: Pet;
  let gameInterval: number;

  onMount(() => {
    // Wczytaj lub utwórz nowego pet
    const savedPet = StorageService.loadPet();
    pet = savedPet ? GameEngine.updatePetStats(savedPet) : StorageService.createNewPet();
    
    // Uruchom główną pętlę gry
    gameInterval = setInterval(() => {
      pet = GameEngine.updatePetStats(pet);
      StorageService.savePet(pet);
    }, 5000);
  });

  onDestroy(() => {
    if (gameInterval) {
      clearInterval(gameInterval);
    }
  });

  // Action handlers
  const handleFeed = () => {
    if (pet.state !== 'dead') {
      pet = GameEngine.feedPet(pet);
      StorageService.savePet(pet);
    }
  };

  const handlePlay = () => {
    if (pet.state !== 'dead' && pet.energy >= 10) {
      pet = GameEngine.playWithPet(pet);
      StorageService.savePet(pet);
      
      // Reset po 2 sekundach
      setTimeout(() => {
        if (pet.state === 'playing') {
          pet = { ...pet, state: GameEngine.calculateState(pet) };
        }
      }, 2000);
    }
  };

  const handleSleep = () => {
    if (pet.state !== 'dead') {
      pet = GameEngine.putPetToSleep(pet);
      StorageService.savePet(pet);
      
      // Obudź po 5 sekundach
      setTimeout(() => {
        if (pet.state === 'sleeping') {
          pet = { ...pet, state: GameEngine.calculateState(pet) };
        }
      }, 5000);
    }
  };

  const resetGame = () => {
    pet = StorageService.createNewPet();
    StorageService.savePet(pet);
  };
</script>

{#if pet}
<div class="tamagotchi-container">
  <div class="tamagotchi-device">
    <div class="device-shell">
      <!-- Top Section -->
      <div class="top-section">
        <div class="speaker-top"></div>
      </div>
      
      <!-- Main Screen Area -->
      <div class="screen-section">
        <Screen {pet} />
      </div>
      
      <!-- Control Section -->
      <div class="control-section">
        <!-- Status Bars -->
        <StatusBars {pet} />
        
        <!-- Control Buttons -->
        <div class="button-group">
          <button class="control-button" 
                  on:click={handleFeed}
                  disabled={pet.state === 'dead'}>
            <span class="button-label">EAT</span>
            <span class="button-number">3</span>
          </button>
          <button class="control-button" 
                  on:click={handleSleep}
                  disabled={pet.state === 'dead'}>
            <span class="button-label">SLEEP</span>
            <span class="button-number">1</span>
          </button>
          <button class="control-button" 
                  on:click={handlePlay}
                  disabled={pet.state === 'dead' || pet.energy < 10}>
            <span class="button-label">PLAY</span>
            <span class="button-number">2</span>
          </button>
        </div>
        
        <!-- Speaker Grille -->
        <div class="speaker-grille">
          <div class="speaker-holes"></div>
        </div>
      </div>
      
      <!-- Reset Button (jeśli pet umarł) -->
      {#if pet.state === 'dead'}
        <div class="reset-section">
          <button class="reset-button" on:click={resetGame}>
            New Pet
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
{/if}

<style>
  .tamagotchi-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f0f0f0;
    font-family: 'Courier New', monospace;
  }

  .tamagotchi-device {
    width: 320px;
    height: 640px;
    position: relative;
  }

  .device-shell {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #e8e8e8, #c0c0c0);
    border: 4px solid #999;
    border-radius: 25px;
    box-shadow: 
      inset 2px 2px 4px rgba(255, 255, 255, 0.8),
      inset -2px -2px 4px rgba(0, 0, 0, 0.2),
      4px 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
  }

  .top-section {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .speaker-top {
    width: 200px;
    height: 8px;
    background: #888;
    border-radius: 4px;
    position: relative;
  }

  .speaker-top::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background: repeating-linear-gradient(
      90deg,
      #666 0px,
      #666 4px,
      transparent 4px,
      transparent 8px
    );
    top: 3px;
  }

  .screen-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
  }

  .screen-bezel {
    width: 240px;
    height: 320px;
    background: #333;
    border-radius: 15px;
    padding: 15px;
    box-shadow: 
      inset 3px 3px 6px rgba(0, 0, 0, 0.7),
      inset -1px -1px 3px rgba(255, 255, 255, 0.1);
  }

  .screen {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #4a5c3a, #2d3d20);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
  }

  .screen::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, transparent 49%, rgba(0, 0, 0, 0.1) 50%, transparent 51%),
      linear-gradient(0deg, transparent 49%, rgba(0, 0, 0, 0.1) 50%, transparent 51%);
    background-size: 4px 4px;
    pointer-events: none;
  }

  .screen-content {
    width: 100%;
    height: 100%;
    background: #4CAF50;
    position: relative;
    border-radius: 5px;
  }

  .character-area {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 48px;
    text-shadow: 2px 2px 0px #2E7D32;
  }

  .control-section {
    height: 160px;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .reset-section {
    text-align: center;
    margin-top: 10px;
  }
  
  .reset-button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }

  .button-group {
    display: flex;
    gap: 12px;
    flex: 1;
    justify-content: center;
  }

  .control-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid #999;
    background: linear-gradient(145deg, #f0f0f0, #d0d0d0);
    box-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.3),
      inset 1px 1px 2px rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: bold;
    color: #333;
    cursor: pointer;
    position: relative;
  }

  .control-button:active {
    box-shadow: 
      inset 2px 2px 4px rgba(0, 0, 0, 0.3),
      1px 1px 2px rgba(255, 255, 255, 0.8);
  }

  .button-label {
    font-size: 9px;
    margin-bottom: 2px;
  }

  .button-number {
    font-size: 7px;
    color: #666;
  }

  .speaker-grille {
    width: 35px;
    height: 80px;
    background: #999;
    border-radius: 8px;
    position: relative;
    box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  .speaker-holes {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 60px;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 2px,
      #666 2px,
      #666 3px
    );
  }

  .speaker-holes::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 2px,
      #666 2px,
      #666 3px
    );
  }
</style>
