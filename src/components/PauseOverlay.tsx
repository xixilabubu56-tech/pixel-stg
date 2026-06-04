import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../types';

export const PauseOverlay: React.FC = () => {
  const phase = useGameStore(s => s.phase);
  const score = useGameStore(s => s.score);
  const stage = useGameStore(s => s.stage);
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => setFlash(f => !f), 500);
    return () => clearInterval(iv);
  }, []);

  const labels: Record<string, string> = {
    paused: 'PAUSED',
    game_over: 'GAME OVER',
    stage_clear: 'STAGE CLEAR!',
    all_clear: 'ALL CLEAR!',
  };

  const label = labels[phase] ?? phase;
  const isPaused = phase === 'paused';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <div style={{
        fontSize: phase === 'game_over' ? 28 : 22,
        color: phase === 'game_over' ? COLORS.terra : COLORS.gold,
        marginBottom: 20,
        textShadow: `3px 3px 0 ${COLORS.brown}`,
      }}>
        {label}
      </div>

      <div style={{ fontSize: 11, color: COLORS.beige, marginBottom: 32 }}>
        SCORE: {score.toLocaleString()}
      </div>

      {isPaused && (
        <div style={{
          fontSize: 10, color: COLORS.gold,
          opacity: flash ? 1 : 0.3,
          marginBottom: 24,
        }}>
          PRESS ESC TO RESUME
        </div>
      )}

      {phase === 'stage_clear' && (
        <button onClick={() => {
          const nextStage = stage + 1;
          const store = useGameStore.getState();
          store.startStage(nextStage);
          store.resume();
        }} style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 12, color: COLORS.gold,
          background: 'transparent', border: `2px solid ${COLORS.gold}`,
          padding: '10px 28px', cursor: 'pointer',
          marginBottom: 16,
        }}>
          NEXT STAGE
        </button>
      )}

      {(phase === 'game_over' || phase === 'all_clear') && (
        <div style={{
          fontSize: 10, color: COLORS.beige, opacity: 0.7,
          marginBottom: 16, textAlign: 'center', lineHeight: 2,
        }}>
          PRESS ESC TO CONTINUE
        </div>
      )}
    </div>
  );
};
