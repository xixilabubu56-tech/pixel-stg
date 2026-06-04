import type { Particle } from '../types';
import { COLORS } from '../types';

export function spawnExplosion(cx: number, cy: number, count: number): Particle[] {
  const particles: Particle[] = [];
  const colors = [COLORS.gold, COLORS.terra, COLORS.beige, '#ff6f00'];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 10 + Math.floor(Math.random() * 15),
      maxLife: 25,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1 + Math.floor(Math.random() * 3),
    });
  }
  return particles;
}
