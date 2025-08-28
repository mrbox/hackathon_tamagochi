<script lang="ts">
  import type { Pet } from '$lib/types/Pet.js';

  export let pet: Pet;

  const getCharacterEmoji = (state: Pet['state']): string => {
    const characters = {
      happy: '🐣',
      hungry: '😋', 
      sleeping: '😴',
      playing: '🎮',
      sick: '🤒',
      dead: '💀'
    };
    return characters[state];
  };

  const getStatusColor = (value: number): string => {
    if (value > 70) return '#44ff44';
    if (value > 30) return '#ffff44'; 
    return '#ff4444';
  };
</script>

<div class="screen-bezel">
  <div class="screen">
    <div class="screen-content">
      <!-- Status Info -->
      <div class="status-info">
        <div class="pet-name">{pet.name}</div>
        <div class="pet-age">Age: {Math.floor(pet.age)}h</div>
      </div>
      
      <!-- Character Display -->
      <div class="character-area">
        <div class="pixel-character" class:animate={pet.state === 'playing'}>
          {getCharacterEmoji(pet.state)}
        </div>
      </div>
      
      <!-- Status Messages -->
      {#if pet.state === 'hungry'}
        <div class="status-message">I'm hungry! 🍎</div>
      {:else if pet.state === 'sleeping'}
        <div class="status-message">Zzz... 💤</div>
      {:else if pet.state === 'sick'}
        <div class="status-message">I don't feel well... 🏥</div>
      {:else if pet.state === 'dead'}
        <div class="status-message">💔 Game Over 💔</div>
      {/if}
    </div>
  </div>
</div>

<style>
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

  .status-info {
    position: absolute;
    top: 10px;
    left: 10px;
    color: #2E7D32;
    font-size: 12px;
    font-weight: bold;
  }

  .character-area {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 48px;
    text-shadow: 2px 2px 0px #2E7D32;
  }

  .status-message {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    color: #2E7D32;
    font-size: 10px;
    text-align: center;
    font-weight: bold;
  }

  .animate {
    animation: bounce 0.5s infinite alternate;
  }

  @keyframes bounce {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-10px); }
  }
</style>
