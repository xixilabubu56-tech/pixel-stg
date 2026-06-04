import React from 'react';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../types';

export const HudPanel: React.FC = () => {
  const score = useGameStore(s => s.score);
  const hiScore = useGameStore(s => s.hiScore);
  const stage = useGameStore(s => s.stage);
  const wave = useGameStore(s => s.wave);
  const lives = useGameStore(s => s.player.lives);
  const shields = useGameStore(s => s.player.shields);
  const bombs = useGameStore(s => s.player.bombs);
  const bossHpMax = useGameStore(s => s.bossHpMax);
  const bossHpNow = useGameStore(s => s.bossHpNow);

  return (
    <div style={{
      width: 200, padding: '16px 14px',
      background: COLORS.brown,
      border: `2px solid ${COLORS.gold}`,
      borderLeft: 'none',
      fontFamily: "'Press Start 2P', monospace",
      fontSize: 10, color: COLORS.beige,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div>
        <div style={{ color: COLORS.gold, fontSize: 8, marginBottom: 2 }}>STATUS</div>
        <div style={{ borderTop: `1px solid ${COLORS.gold}`, paddingTop: 8 }} />
      </div>

      <div>
        <div style={{ fontSize: 7, color: COLORS.beige, opacity: 0.6 }}>SCORE</div>
        <div style={{ color: COLORS.gold, fontSize: 12 }}>{score.toLocaleString()}</div>
      </div>

      <div>
        <div style={{ fontSize: 7, color: COLORS.beige, opacity: 0.6 }}>HI-SCORE</div>
        <div style={{ color: COLORS.beige, fontSize: 10 }}>{hiScore.toLocaleString()}</div>
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.terra}`, paddingTop: 8 }}>
        <div style={{ fontSize: 7, color: COLORS.beige, opacity: 0.6 }}>STAGE</div>
        <div style={{ color: COLORS.gold }}>{stage + 1} - {wave + 1}</div>
      </div>

      <div>
        <div style={{ fontSize: 7, color: COLORS.beige, opacity: 0.6 }}>LIVES</div>
        <div style={{ color: COLORS.gold, fontSize: 12 }}>
          {'<3 '.repeat(Math.max(0, lives))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 7, color: COLORS.beige, opacity: 0.6 }}>SHIELDS</div>
        <div style={{ color: '#4fc3f7', fontSize: 10 }}>{'O '.repeat(shields)}{shields === 0 && '-'}</div>
      </div>

      <div>
        <div style={{ fontSize: 7, color: COLORS.beige, opacity: 0.6 }}>BOMBS</div>
        <div style={{ color: COLORS.terra, fontSize: 12 }}>{'* '.repeat(bombs)}{bombs === 0 && '-'}</div>
      </div>

      {bossHpMax > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.terra}`, paddingTop: 8 }}>
          <div style={{ fontSize: 7, color: COLORS.terra, marginBottom: 4 }}>BOSS</div>
          <div style={{ background: '#000', height: 8, border: `1px solid ${COLORS.terra}` }}>
            <div style={{
              width: `${(bossHpNow / bossHpMax) * 100}%`,
              height: '100%',
              background: COLORS.terra,
              transition: 'width 0.1s',
            }} />
          </div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${COLORS.gold}`, paddingTop: 8, fontSize: 7, color: COLORS.beige, opacity: 0.5, lineHeight: 2 }}>
        <div>Z: FIRE</div>
        <div>X: BOMB</div>
        <div>ARR: MOVE</div>
        <div>SHF: SLOW</div>
        <div>ESC: PAUSE</div>
      </div>
    </div>
  );
};
