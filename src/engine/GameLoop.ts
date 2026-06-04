import { useGameStore } from '../store/gameStore';

export class GameLoop {
  private rafId: number = 0;
  private running: boolean = false;

  start() {
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      useGameStore.getState().tick();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
