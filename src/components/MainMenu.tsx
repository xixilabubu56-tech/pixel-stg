import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { resumeAudio } from '../engine/Audio';
import { COLORS } from '../types';

export const MainMenu: React.FC = () => {
  const startGame = useGameStore(s => s.startGame);
  const hiScore = useGameStore(s => s.hiScore);
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => setFlash(f => !f), 600);
    return () => clearInterval(iv);
  }, []);

  const handleStart = () => {
    resumeAudio();
    startGame();
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: COLORS.bg,
      zIndex: 100,
    }}>
      <div style={{
        fontSize: 32, color: COLORS.gold, fontFamily: "'Press Start 2P', monospace",
        textShadow: `4px 4px 0 ${COLORS.terra}`,
        marginBottom: 8,
      }}>
        PIXEL STG
      </div>

      <div style={{
        fontSize: 10, color: COLORS.beige, fontFamily: "'Press Start 2P', monospace",
        marginBottom: 48, opacity: 0.6,
      }}>
        SHOOT OR DIE
      </div>

      {hiScore > 0 && (
        <div style={{
          fontSize: 10, color: COLORS.beige, fontFamily: "'Press Start 2P', monospace",
          marginBottom: 40,
        }}>
          HI-SCORE: {hiScore.toLocaleString()}
        </div>
      )}

      <button onClick={handleStart} style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 16, color: COLORS.gold,
        background: 'transparent', border: `2px solid ${COLORS.gold}`,
        padding: '12px 40px', cursor: 'pointer',
        opacity: flash ? 1 : 0.3,
        transition: 'opacity 0.3s',
        marginBottom: 24,
      }}>
        START
      </button>

      <div style={{
        position: 'absolute', bottom: 40,
        fontSize: 9, color: COLORS.beige, opacity: 0.5,
        fontFamily: "'Press Start 2P', monospace",
        textAlign: 'center', lineHeight: 2,
      }}>
        2026 PIXEL STG
      </div>
    </div>
  );
};
