import type { GameState } from '../types';
import { GAME, COLORS } from '../types';

export function render(ctx: CanvasRenderingContext2D, state: GameState) {
  const W = GAME.WIDTH, H = GAME.HEIGHT;
  ctx.imageSmoothingEnabled = false;

  // Background
  const stageColors: [string, string][] = [
    ['#1a3a5c', '#87ceeb'],
    ['#1a3a2a', '#4a90d9'],
    ['#0a0a1a', '#1a1a3e'],
  ];
  const [bgTop, bgBottom] = stageColors[state.stage] ?? stageColors[0];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, bgTop);
  grad.addColorStop(1, bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < H; i += 3) ctx.fillRect(0, i, W, 1);

  // Scene elements
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  if (state.stage === 2) {
    for (let i = 0; i < 30; i++) {
      const sx = (i * 37 + 13) % W, sy = (i * 53 + state.frameCount * 0.3) % H;
      ctx.fillRect(sx, sy, 1 + (i % 2), 1 + (i % 2));
    }
  } else if (state.stage === 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 6; i++) {
      const wy = 80 + i * 18 + Math.sin(state.frameCount * 0.02 + i) * 4;
      ctx.fillRect(0, wy, W, 2);
    }
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 83 + 7) + state.frameCount * 0.15) % W - 20;
      const cy = 20 + i * 30;
      ctx.fillRect(cx, cy, 32 + i * 8, 8);
    }
  }

  // Powerups
  for (const pu of state.powerUps) {
    if (pu.kind === 'bomb') {
      ctx.fillStyle = COLORS.terra;
      ctx.fillRect(pu.x - 1, pu.y, 6, 8);
      ctx.fillRect(pu.x - 3, pu.y + 8, 10, 4);
      ctx.fillStyle = COLORS.beige;
      ctx.fillRect(pu.x, pu.y + 2, 4, 4);
      ctx.fillStyle = COLORS.gold;
      ctx.font = '6px monospace';
      ctx.fillText('B', pu.x, pu.y + 7);
    } else {
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(pu.x, pu.y, 8, 8);
      ctx.fillStyle = '#b3e5fc';
      ctx.fillRect(pu.x + 2, pu.y + 2, 4, 4);
      ctx.font = '6px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText('S', pu.x + 1, pu.y + 7);
    }
  }

  // Player bullets
  for (const b of state.bullets) {
    if (!b.fromPlayer) continue;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, 2, 6);
  }

  // Enemy bullets
  for (const b of state.bullets) {
    if (b.fromPlayer) continue;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x - 1, b.y - 1, 3, 3);
  }

  // Enemies
  for (const e of state.enemies) {
    drawEnemy(ctx, e);
  }

  // Player
  const p = state.player;
  if (p.invincibleTimer % 4 < 2) {
    drawPlayer(ctx, p.x, p.y);
  }

  // Shield effect
  if (p.shields > 0) {
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1;
    ctx.strokeRect(p.x - 2, p.y - 2, p.width + 4, p.height + 4);
  }

  // Particles
  for (const pt of state.particles) {
    const alpha = pt.life / pt.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;

  // Bomb flash
  if (state.bombFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${state.bombFlash / 30 * 0.6})`;
    ctx.fillRect(0, 0, W, H);
  }

  // CRT vignette
  const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.6, W / 2, H / 2, W * 0.4);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawPlayer(ctx: CanvasRenderingContext2D, px: number, py: number) {
  ctx.fillStyle = COLORS.beige;
  ctx.fillRect(px + 6, py, 4, 4);
  ctx.fillRect(px + 2, py + 4, 12, 4);
  ctx.fillRect(px, py + 8, 16, 4);
  ctx.fillRect(px + 4, py + 12, 8, 4);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(px + 4, py + 2, 8, 4);
  ctx.fillRect(px + 8, py + 6, 4, 2);
  // Engine flame
  ctx.fillStyle = COLORS.terra;
  ctx.fillRect(px + 6, py + 16, 4, 2 + Math.random() * 2);
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: any) {
  const d = e.def;
  ctx.fillStyle = d.color;
  const ex = e.x, ey = e.y;

  switch (d.kind) {
    case 'scout':
      ctx.fillRect(ex + 6, ey + 2, 4, 4);
      ctx.fillRect(ex + 2, ey + 6, 12, 4);
      ctx.fillRect(ex, ey + 10, 16, 4);
      ctx.fillRect(ex + 4, ey + 14, 8, 2);
      ctx.fillStyle = d.colorLight;
      ctx.fillRect(ex + 4, ey + 8, 8, 2);
      break;
    case 'fighter':
      ctx.fillRect(ex + 6, ey, 4, 8);
      ctx.fillRect(ex, ey + 4, 16, 4);
      ctx.fillRect(ex + 2, ey + 8, 12, 6);
      ctx.fillStyle = d.colorLight;
      ctx.fillRect(ex + 4, ey + 6, 8, 2);
      break;
    case 'bomber':
      ctx.fillRect(ex + 4, ey, 16, 6);
      ctx.fillRect(ex + 2, ey + 6, 20, 6);
      ctx.fillRect(ex, ey + 12, 24, 8);
      ctx.fillRect(ex + 4, ey + 20, 16, 4);
      ctx.fillStyle = d.colorDark;
      ctx.fillRect(ex, ey + 12, 4, 6);
      ctx.fillRect(ex + 20, ey + 12, 4, 6);
      break;
    case 'sniper':
      ctx.fillRect(ex + 6, ey, 4, 6);
      ctx.fillRect(ex + 4, ey + 6, 8, 4);
      ctx.fillRect(ex, ey + 10, 16, 6);
      ctx.fillRect(ex + 4, ey + 16, 8, 2);
      ctx.fillStyle = d.colorDark;
      ctx.fillRect(ex + 6, ey + 2, 4, 4);
      break;
    case 'speeder':
      ctx.fillRect(ex + 8, ey, 4, 6);
      ctx.fillRect(ex + 2, ey + 4, 6, 4);
      ctx.fillRect(ex + 12, ey + 4, 6, 4);
      ctx.fillRect(ex, ey + 8, 20, 6);
      ctx.fillRect(ex + 4, ey + 14, 12, 4);
      ctx.fillStyle = d.colorDark;
      ctx.fillRect(ex + 2, ey + 10, 16, 2);
      break;
    case 'boss':
      ctx.fillRect(ex + 8, ey, 32, 6);
      ctx.fillRect(ex + 4, ey + 6, 40, 6);
      ctx.fillRect(ex, ey + 12, 48, 12);
      ctx.fillRect(ex + 4, ey + 24, 40, 8);
      ctx.fillRect(ex + 12, ey + 32, 24, 4);
      ctx.fillStyle = d.colorDark;
      ctx.fillRect(ex + 24, ey, 12, 6);
      ctx.fillRect(ex, ey + 14, 4, 8);
      ctx.fillRect(ex + 44, ey + 14, 4, 8);
      ctx.fillStyle = d.colorLight;
      ctx.fillRect(ex + 16, ey + 14, 16, 6);
      break;
  }
}
