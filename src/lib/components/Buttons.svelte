<script lang="ts">
  export let onPlay: () => void;
  export let onEat: () => void;
  export let onSleep: () => void;
  export let onReset: () => void;
  export let isGameOver: boolean = false;
</script>

<div class="buttons-container">
  <div class="button-row">
    <button 
      class="tamagotchi-button play-button" 
      on:click={onPlay}
      disabled={isGameOver}
    >
      🎮 GRAJ
    </button>
    
    <button 
      class="tamagotchi-button eat-button" 
      on:click={onEat}
      disabled={isGameOver}
    >
      🍎 JEDZ
    </button>
  </div>
  
  <div class="button-row">
    <button 
      class="tamagotchi-button sleep-button" 
      on:click={onSleep}
      disabled={isGameOver}
    >
      😴 ŚPIJ
    </button>
    
    {#if isGameOver}
      <button 
        class="tamagotchi-button reset-button" 
        on:click={onReset}
      >
        🔄 RESTART
      </button>
    {:else}
      <div class="button-placeholder"></div>
    {/if}
  </div>
</div>

<style>
  .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    border: 3px solid #6b7280;
    border-radius: 12px;
    width: 420px;
  }
  
  .button-row {
    display: flex;
    gap: 15px;
  }
  
  .tamagotchi-button {
    flex: 1;
    height: 60px;
    border: 3px solid #9ca3af;
    border-radius: 8px;
    background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
    color: white;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .tamagotchi-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: #d1d5db;
  }
  
  .tamagotchi-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .tamagotchi-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .play-button {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    border-color: #34d399;
  }
  
  .play-button:hover:not(:disabled) {
    border-color: #6ee7b7;
  }
  
  .eat-button {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    border-color: #f87171;
  }
  
  .eat-button:hover:not(:disabled) {
    border-color: #fca5a5;
  }
  
  .sleep-button {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    border-color: #60a5fa;
  }
  
  .sleep-button:hover:not(:disabled) {
    border-color: #93c5fd;
  }
  
  .reset-button {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    border-color: #a78bfa;
  }
  
  .reset-button:hover:not(:disabled) {
    border-color: #c4b5fd;
  }
  
  .button-placeholder {
    flex: 1;
    height: 60px;
  }
</style>
