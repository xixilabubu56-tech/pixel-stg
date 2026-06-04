import { useEffect, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import { GameLoop } from './engine/GameLoop';
import { render } from './engine/Renderer';
import { initInput, handleSpecialKeys } from './engine/Input';
import { GAME } from './types';
import { HudPanel } from './components/HudPanel';
import { MainMenu } from './components/MainMenu';
import { PauseOverlay } from './components/PauseOverlay';
import './App.css';

export default function App() {
  const phase = useGameStore(s => s.phase);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopRef = useRef<GameLoop | null>(null);

  useEffect(() => {
    const cleanup = initInput();
    const cleanupSpecial = handleSpecialKeys();
    return () => { cleanup(); cleanupSpecial(); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = new GameLoop();
    loopRef.current = loop;

    const draw = () => {
      const state = useGameStore.getState();
      render(ctx, state);
      if (state.phase === 'playing' || state.phase === 'paused') {
        requestAnimationFrame(draw);
      }
    };

    if (phase === 'playing' || phase === 'paused') {
      loop.start();
      requestAnimationFrame(draw);
    } else {
      loop.stop();
      const state = useGameStore.getState();
      render(ctx, state);
    }

    return () => loop.stop();
  }, [phase]);

  return (
    <div className="app">
      <div className="game-container">
        <div className="canvas-area">
          <canvas
            ref={canvasRef}
            width={GAME.WIDTH}
            height={GAME.HEIGHT}
            className="game-canvas"
          />
        </div>
        {phase !== 'main_menu' && <HudPanel />}
      </div>
      {phase === 'main_menu' && <MainMenu />}
      {(phase === 'paused' || phase === 'game_over' || phase === 'stage_clear' || phase === 'all_clear') && (
        <PauseOverlay />
      )}
    </div>
  );
}
