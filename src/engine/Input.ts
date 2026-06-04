import { useGameStore } from '../store/gameStore';

const trackedKeys = [
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'KeyZ', 'KeyX', 'KeyC',
  'ShiftLeft', 'ShiftRight',
  'Escape',
];

export function initInput() {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (trackedKeys.includes(e.code)) {
      e.preventDefault();
      useGameStore.getState().setKey(e.code, true);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (trackedKeys.includes(e.code)) {
      e.preventDefault();
      useGameStore.getState().setKey(e.code, false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}

export function handleSpecialKeys() {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      const phase = useGameStore.getState().phase;
      if (phase === 'playing') {
        useGameStore.getState().pause();
      } else if (phase === 'paused') {
        useGameStore.getState().resume();
      } else if (phase === 'game_over' || phase === 'stage_clear' || phase === 'all_clear') {
        useGameStore.getState().toMenu();
      }
    }
    if (e.code === 'KeyX') {
      const st = useGameStore.getState();
      if (st.phase === 'playing' && st.bombFlash <= 0) {
        useGameStore.getState().useBomb();
      }
    }
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}
