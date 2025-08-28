<script lang="ts">
  import type { Pet } from '$lib/models/Pet';
  
  export let pet: Pet;
  
  // Funkcja do określania koloru paska na podstawie wartości
  const getBarColor = (value: number): string => {
    if (value >= 80) return '#10b981'; // zielony
    if (value >= 50) return '#f59e0b'; // żółty
    if (value >= 20) return '#ef4444'; // czerwony
    return '#dc2626'; // ciemny czerwony
  };
  
  // Funkcja do określania koloru paska Vibe na podstawie wartości
  const getVibeColor = (value: number): string => {
    if (value >= 80) return '#8b5cf6'; // fioletowy
    if (value >= 60) return '#06b6d4'; // cyjan
    if (value >= 40) return '#f59e0b'; // żółty
    if (value >= 20) return '#f97316'; // pomarańczowy
    return '#dc2626'; // czerwony
  };
  
  // Funkcja do określania emoji zwierzaka na podstawie stanu i etapu ewolucji
  const getPetEmoji = (state: Pet['state'], stage: Pet['stage']): string => {
    if (state === 'dead') return '💀';
    if (state === 'sick') return '🤒';
    if (state === 'sleeping') return '😴';
    
    switch (stage) {
      case 'egg':
        return '🥚';
      case 'baby':
        switch (state) {
          case 'happy': return '🐣';
          case 'hungry': return '🐤';
          default: return '🐣';
        }
      case 'teen':
        switch (state) {
          case 'happy': return '🐥';
          case 'hungry': return '🐤';
          default: return '🐥';
        }
      case 'adult':
        switch (state) {
          case 'happy': return '🐔';
          case 'hungry': return '🐓';
          default: return '🐔';
        }
      case 'elder':
        switch (state) {
          case 'happy': return '🦅';
          case 'hungry': return '🦅';
          default: return '🦅';
        }
      default:
        return '🐣';
    }
  };
</script>

<div class="screen-container">
  <!-- Ekran zwierzaka -->
  <div class="pet-display">
    <div class="pet-character {pet.state}">
      <div class="pet-emoji">
        {getPetEmoji(pet.state, pet.stage)}
      </div>
      <div class="pet-status">
        {pet.state.toUpperCase()}
      </div>
    </div>
  </div>
  
  <!-- Paski stanu -->
  <div class="status-bars">
    <div class="status-bar">
      <div class="status-label">GŁÓD</div>
      <div class="bar-container">
        <div 
          class="bar-fill" 
          style="width: {pet.hunger}%; background-color: {getBarColor(pet.hunger)}"
        ></div>
      </div>
      <div class="status-value">{pet.hunger}%</div>
    </div>
    
    <div class="status-bar">
      <div class="status-label">SZCZĘŚCIE</div>
      <div class="bar-container">
        <div 
          class="bar-fill" 
          style="width: {pet.happiness}%; background-color: {getBarColor(pet.happiness)}"
        ></div>
      </div>
      <div class="status-value">{pet.happiness}%</div>
    </div>
    
    <div class="status-bar">
      <div class="status-label">ZDROWIE</div>
      <div class="bar-container">
        <div 
          class="bar-fill" 
          style="width: {pet.health}%; background-color: {getBarColor(pet.health)}"
        ></div>
      </div>
      <div class="status-value">{pet.health}%</div>
    </div>
    
    <div class="status-bar">
      <div class="status-label">VIBE</div>
      <div class="bar-container">
        <div 
          class="bar-fill" 
          style="width: {pet.vibeLevel}%; background-color: {getVibeColor(pet.vibeLevel)}"
        ></div>
      </div>
      <div class="status-value">{pet.vibeLevel}%</div>
    </div>
  </div>
  
  <!-- Komunikat o śmierci -->
  {#if pet.state === 'dead'}
    <div class="game-over">
      <h2>GRA SKOŃCZONA</h2>
      <p>Twój zwierzak umarł 😢</p>
    </div>
  {/if}
</div>

<style>
  .screen-container {
    width: 420px;
    height: 480px;
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border: 4px solid #374151;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'Courier New', monospace;
    color: white;
    image-rendering: pixelated;
  }
  
  .pet-display {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    border: 2px solid #6b7280;
  }
  
  .pet-character {
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .pet-character.sleeping {
    opacity: 0.7;
  }
  
  .pet-character.dead {
    opacity: 0.5;
    filter: grayscale(100%);
  }
  
  .pet-emoji {
    font-size: 80px;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .pet-status {
    font-size: 14px;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
  
  .status-bars {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .status-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
  }
  
  .status-label {
    width: 60px;
    font-weight: bold;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  }
  
  .bar-container {
    flex: 1;
    height: 20px;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid #6b7280;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .bar-fill {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
    border-radius: 8px;
  }
  
  .status-value {
    width: 40px;
    text-align: right;
    font-weight: bold;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  }
  
  .game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(220, 38, 38, 0.9);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    border: 3px solid #dc2626;
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
  }
  
  .game-over h2 {
    margin: 0 0 10px 0;
    font-size: 18px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }
  
  .game-over p {
    margin: 0;
    font-size: 14px;
  }
</style>
