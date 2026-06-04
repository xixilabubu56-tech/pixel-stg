import { create } from 'zustand';
import type { GameStore, Player, Enemy, Bullet, PowerUp, Particle } from '../types';
import { GAME, COLORS } from '../types';
import { enemyDefs } from '../engine/EnemyAI';
import { checkCollision } from '../engine/Collision';
import { spawnExplosion } from '../engine/Particle';

function makePlayer(): Player {
  return {
    x: GAME.WIDTH / 2 - 8,
    y: GAME.HEIGHT - 24,
    vx: 0, vy: 0,
    width: 16, height: 16,
    lives: 3,
    shields: 0,
    bombs: 3,
    fireTimer: 0,
    invincibleTimer: 120,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'main_menu',
  score: 0,
  hiScore: 0,
  stage: 0,
  wave: 0,
  player: makePlayer(),
  enemies: [],
  bullets: [],
  powerUps: [],
  particles: [],
  frameCount: 0,
  keys: new Set<string>(),
  bombFlash: 0,
  bossHpMax: 0,
  bossHpNow: 0,

  startGame: () => {
    set({
      phase: 'playing',
      score: 0,
      stage: 0,
      wave: 0,
      player: makePlayer(),
      enemies: [],
      bullets: [],
      powerUps: [],
      particles: [],
      frameCount: 0,
      bombFlash: 0,
      bossHpMax: 0,
      bossHpNow: 0,
    });
    get().startStage(0);
  },

  startStage: (stage: number) => {
    set({ stage, wave: 0, enemies: [], bullets: [], powerUps: [], particles: [], bombFlash: 0 });
    get().nextWave();
  },

  nextWave: () => {
    const { stage, wave } = get();
    if (wave >= 4) {
      get().spawnBoss();
      return;
    }
    const defs = enemyDefs;
    const waveEnemies: Enemy[] = [];
    let id = 0;
    const kindMap: Array<{ kind: string; count: number; path: string }> = [];
    if (stage === 0) {
      if (wave === 0) kindMap.push({ kind: 'scout', count: 5, path: 'straight' });
      if (wave === 1) { kindMap.push({ kind: 'scout', count: 6, path: 'straight' }); kindMap.push({ kind: 'fighter', count: 2, path: 'straight' }); }
      if (wave === 2) { kindMap.push({ kind: 'fighter', count: 4, path: 'straight' }); kindMap.push({ kind: 'speeder', count: 2, path: 'zigzag' }); }
      if (wave === 3) { kindMap.push({ kind: 'fighter', count: 5, path: 'straight' }); kindMap.push({ kind: 'speeder', count: 3, path: 'zigzag' }); }
    } else if (stage === 1) {
      if (wave === 0) { kindMap.push({ kind: 'scout', count: 4, path: 'zigzag' }); kindMap.push({ kind: 'fighter', count: 3, path: 'straight' }); }
      if (wave === 1) { kindMap.push({ kind: 'bomber', count: 2, path: 'straight' }); kindMap.push({ kind: 'fighter', count: 3, path: 'straight' }); }
      if (wave === 2) { kindMap.push({ kind: 'sniper', count: 2, path: 'hover' }); kindMap.push({ kind: 'bomber', count: 2, path: 'straight' }); }
      if (wave === 3) { kindMap.push({ kind: 'bomber', count: 3, path: 'straight' }); kindMap.push({ kind: 'sniper', count: 2, path: 'hover' }); }
    } else {
      if (wave === 0) { kindMap.push({ kind: 'speeder', count: 3, path: 'zigzag' }); kindMap.push({ kind: 'sniper', count: 1, path: 'hover' }); }
      if (wave === 1) { kindMap.push({ kind: 'fighter', count: 4, path: 'straight' }); kindMap.push({ kind: 'bomber', count: 2, path: 'straight' }); }
      if (wave === 2) { kindMap.push({ kind: 'bomber', count: 2, path: 'straight' }); kindMap.push({ kind: 'sniper', count: 2, path: 'hover' }); kindMap.push({ kind: 'speeder', count: 2, path: 'zigzag' }); }
      if (wave === 3) { kindMap.push({ kind: 'bomber', count: 3, path: 'straight' }); kindMap.push({ kind: 'sniper', count: 2, path: 'hover' }); kindMap.push({ kind: 'speeder', count: 3, path: 'zigzag' }); }
    }
    for (const g of kindMap) {
      const def = defs[g.kind as keyof typeof defs];
      for (let i = 0; i < g.count; i++) {
        waveEnemies.push({
          id: id++,
          def,
          x: 20 + Math.random() * (GAME.WIDTH - 60),
          y: -10 - Math.random() * 40,
          hp: def.hp,
          frame: 0,
          phase: 0,
          shotTimer: 60 + Math.random() * 60,
          specialTimer: Math.random() * 60,
          specialState: 0,
          canShoot: g.kind !== 'scout' && g.kind !== 'speeder',
          speedX: 0,
          speedY: def.kind === 'speeder' ? 4 : def.kind === 'scout' ? 1.5 : 1,
        });
      }
    }
    set({ wave, enemies: waveEnemies, bossHpMax: 0, bossHpNow: 0 });
  },

  spawnBoss: () => {
    const { stage } = get();
    const bossDef = enemyDefs.boss;
    const bossHp = 40 + stage * 20;
    set({
      bossHpMax: bossHp,
      bossHpNow: bossHp,
      enemies: [{
        id: 999,
        def: bossDef,
        x: GAME.WIDTH / 2 - bossDef.width / 2,
        y: -bossDef.height,
        hp: bossHp,
        frame: 0,
        phase: 0,
        shotTimer: 40,
        specialTimer: 0,
        specialState: 0,
        canShoot: true,
        speedX: 0,
        speedY: 0.3,
      }],
    });
  },

  pause: () => set({ phase: 'paused' }),
  resume: () => set({ phase: 'playing' }),
  toMenu: () => set({ phase: 'main_menu' }),

  gameOver: () => {
    const { score, hiScore } = get();
    set({ phase: 'game_over', hiScore: Math.max(score, hiScore) });
  },

  stageClear: () => set({ phase: 'stage_clear' }),

  allClear: () => {
    const { score, hiScore } = get();
    set({ phase: 'all_clear', hiScore: Math.max(score, hiScore) });
  },

  setKey: (key: string, pressed: boolean) => {
    set(s => {
      const next = new Set(s.keys);
      pressed ? next.add(key) : next.delete(key);
      return { keys: next };
    });
  },

  useBomb: () => {
    const p = get().player;
    if (p.bombs <= 0 || get().bombFlash > 0) return;
    set(s => ({
      player: { ...s.player, bombs: s.player.bombs - 1 },
      bombFlash: 30,
      bullets: s.bullets.filter(b => !b.fromPlayer),
      enemies: [],
      powerUps: [],
    }));
  },

  tick: () => {
    const s = get();
    if (s.phase !== 'playing') return;

    const next = { ...s };
    next.frameCount = s.frameCount + 1;
    if (next.bombFlash > 0) next.bombFlash--;

    const keys = s.keys;

    // ---- 玩家移动 ----
    let px = s.player.x, py = s.player.y;
    let pvx = s.player.vx, pvy = s.player.vy;
    const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? GAME.PLAYER_SLOW : GAME.PLAYER_SPEED;

    if (keys.has('ArrowLeft')) pvx = -speed;
    else if (keys.has('ArrowRight')) pvx = speed;
    else pvx *= GAME.INERTIA;

    if (keys.has('ArrowUp')) pvy = -speed;
    else if (keys.has('ArrowDown')) pvy = speed;
    else pvy *= GAME.INERTIA;

    px += pvx;
    py += pvy;
    if (px < 0) px = 0;
    if (px > GAME.WIDTH - s.player.width) px = GAME.WIDTH - s.player.width;
    if (py < 0) py = 0;
    if (py > GAME.HEIGHT - s.player.height) py = GAME.HEIGHT - s.player.height;

    const fireTimer = s.player.fireTimer > 0 ? s.player.fireTimer - 1 : 0;
    const invincibleTimer = s.player.invincibleTimer > 0 ? s.player.invincibleTimer - 1 : 0;

    let player: Player = { ...s.player, x: px, y: py, vx: pvx, vy: pvy, fireTimer, invincibleTimer };

    // ---- 玩家射击 ----
    let bullets = [...s.bullets];
    if (keys.has('KeyZ') && player.fireTimer <= 0) {
      player.fireTimer = GAME.FIRE_INTERVAL;
      const cx = player.x + player.width / 2;
      bullets.push(
        { id: next.frameCount * 10 + 1, x: cx - 4, y: player.y - 4, vx: 0, vy: -6, fromPlayer: true, color: COLORS.gold },
        { id: next.frameCount * 10 + 2, x: cx + 4, y: player.y - 4, vx: 0, vy: -6, fromPlayer: true, color: COLORS.gold },
      );
    }

    // ---- 子弹移动 ----
    const liveBullets: Bullet[] = [];
    for (const b of bullets) {
      const bx = b.x + b.vx, by = b.y + b.vy;
      if (by < -8 || by > GAME.HEIGHT + 8 || bx < -8 || bx > GAME.WIDTH + 8) continue;
      liveBullets.push({ ...b, x: bx, y: by });
    }

    // ---- 敌机移动 ----
    let enemies = [...s.enemies];
    const newBullets: Bullet[] = [];
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = { ...enemies[i] };
      e.frame++;

      if (e.def.kind === 'boss') {
        if (e.y < 20) e.y += e.speedY;
        const hpRatio = e.hp / s.bossHpMax;
        e.phase = hpRatio > 0.7 ? 0 : hpRatio > 0.3 ? 1 : 2;
        e.shotTimer--;
        if (e.shotTimer <= 0 && next.bombFlash <= 0) {
          const interval = e.phase === 0 ? 30 : e.phase === 1 ? 22 : 14;
          e.shotTimer = interval;
          const cx = e.x + e.def.width / 2;
          const by = e.y + e.def.height;
          const spread = e.phase === 0 ? 3 : e.phase === 1 ? 5 : 8;
          for (let j = 0; j < spread; j++) {
            const angle = (Math.PI / 4) + (j * Math.PI / 2) / (spread - 1 || 1);
            newBullets.push({ id: next.frameCount * 100 + j, x: cx, y: by, vx: Math.cos(angle) * 2, vy: Math.sin(angle) * 2, fromPlayer: false, color: COLORS.terra });
          }
          if (e.phase >= 1) {
            const dx = player.x + player.width / 2 - cx;
            const dy = player.y + player.height / 2 - by;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            newBullets.push({ id: next.frameCount * 100 + 99, x: cx, y: by, vx: (dx / dist) * 2.5, vy: (dy / dist) * 2.5, fromPlayer: false, color: COLORS.terra });
          }
        }
        enemies[i] = e;
        continue;
      }

      if (e.def.kind === 'speeder') {
        e.specialTimer--;
        if (e.specialTimer <= 0) { e.specialTimer = 15; e.specialState = (e.specialState + 1) % 2; }
        e.y += e.speedY;
        e.x += e.specialState === 0 ? 3 : -3;
      } else if (e.def.kind === 'sniper') {
        if (e.y < 30 + Math.random() * 40) {
          e.speedY = 0.3 + Math.random() * 0.3;
        } else {
          e.speedY = 0;
          e.speedX = 0;
        }
        e.y += e.speedY;
        e.x += e.speedX;
        e.specialTimer--;
        e.shotTimer--;
        if (e.shotTimer <= 0 && next.bombFlash <= 0) {
          e.shotTimer = 50;
          const cx = e.x + e.def.width / 2, cy = e.y + e.def.height;
          const dx = player.x + player.width / 2 - cx;
          const dy = player.y + player.height / 2 - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          newBullets.push({ id: next.frameCount * 200 + i, x: cx, y: cy, vx: (dx / dist) * 3, vy: (dy / dist) * 3, fromPlayer: false, color: '#ba68c8' });
        }
      } else {
        e.y += e.speedY;
      }

      if (e.y > GAME.HEIGHT + 20 || e.x < -20 || e.x > GAME.WIDTH + 20) {
        enemies.splice(i, 1);
        continue;
      }

      if (e.canShoot && next.bombFlash <= 0) {
        e.shotTimer--;
        if (e.shotTimer <= 0) {
          e.shotTimer = e.def.kind === 'bomber' ? 40 : 80;
          const cx = e.x + e.def.width / 2, cy = e.y + e.def.height;
          if (e.def.kind === 'bomber') {
            newBullets.push(
              { id: next.frameCount * 300 + i * 3, x: cx, y: cy, vx: -1, vy: 3, fromPlayer: false, color: COLORS.terra },
              { id: next.frameCount * 300 + i * 3 + 1, x: cx, y: cy, vx: 0, vy: 3.5, fromPlayer: false, color: COLORS.terra },
              { id: next.frameCount * 300 + i * 3 + 2, x: cx, y: cy, vx: 1, vy: 3, fromPlayer: false, color: COLORS.terra },
            );
          } else {
            newBullets.push({ id: next.frameCount * 300 + i, x: cx, y: cy, vx: 0, vy: 3, fromPlayer: false, color: COLORS.terra });
          }
        }
      }
      enemies[i] = e;
    }

    // ---- 碰撞: 玩家子弹 vs 敌机 ----
    const particles: Particle[] = [...s.particles];
    for (let i = liveBullets.length - 1; i >= 0; i--) {
      const b = liveBullets[i];
      if (!b.fromPlayer) continue;
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (checkCollision({ x: b.x, y: b.y, w: 3, h: 10 }, { x: enemies[j].x, y: enemies[j].y, w: enemies[j].def.width, h: enemies[j].def.height })) {
          liveBullets.splice(i, 1);
          enemies[j] = { ...enemies[j], hp: enemies[j].hp - 1 };
          if (enemies[j].hp <= 0) {
            const dead = enemies[j];
            const bossKill = dead.def.kind === 'boss';
            particles.push(...spawnExplosion(dead.x + dead.def.width / 2, dead.y + dead.def.height / 2, bossKill ? 20 : 8));
            if (bossKill) {
              const drops = s.powerUps;
              drops.push({ id: next.frameCount * 500 + 1, kind: 'bomb', x: dead.x + dead.def.width / 2 - 6, y: dead.y + dead.def.height / 2, vy: 1 });
              drops.push({ id: next.frameCount * 500 + 2, kind: 'shield', x: dead.x + dead.def.width / 2 + 6, y: dead.y + dead.def.height / 2, vy: 1 });
            } else if (Math.random() < 0.05) {
              const drops = s.powerUps;
              drops.push({ id: next.frameCount * 500 + dead.id, kind: 'bomb', x: dead.x + dead.def.width / 2, y: dead.y + dead.def.height / 2, vy: 1.5 });
            } else if (Math.random() < 0.03) {
              const drops = s.powerUps;
              drops.push({ id: next.frameCount * 500 + dead.id, kind: 'shield', x: dead.x + dead.def.width / 2, y: dead.y + dead.def.height / 2, vy: 1.5 });
            }
            enemies.splice(j, 1);
          }
          break;
        }
      }
    }

    // ---- 碰撞: 敌方子弹 vs 玩家 ----
    if (player.invincibleTimer <= 0) {
      for (let i = liveBullets.length - 1; i >= 0; i--) {
        const b = liveBullets[i];
        if (b.fromPlayer) continue;
        if (checkCollision({ x: b.x, y: b.y, w: 3, h: 8 }, { x: player.x, y: player.y, w: player.width, h: player.height })) {
          liveBullets.splice(i, 1);
          if (player.shields > 0) {
            player.shields--;
            player.invincibleTimer = 60;
            particles.push(...spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, 4));
          } else {
            player.lives--;
            player.invincibleTimer = GAME.INVINCIBLE_FRAMES;
            particles.push(...spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, 12));
            if (player.lives <= 0) {
              next.player = player;
              next.enemies = enemies;
              next.bullets = [...liveBullets, ...newBullets];
              next.particles = particles;
              next.score = s.score;
              next.bossHpNow = enemies.find(e => e.def.kind === 'boss')?.hp ?? 0;
              set(next);
              setTimeout(() => get().gameOver(), 800);
              return;
            }
          }
          break;
        }
      }
    }

    // ---- 碰撞: 敌机 vs 玩家 (撞击) ----
    if (player.invincibleTimer <= 0) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (checkCollision({ x: enemies[j].x, y: enemies[j].y, w: enemies[j].def.width, h: enemies[j].def.height }, { x: player.x, y: player.y, w: player.width, h: player.height })) {
          enemies.splice(j, 1);
          if (player.shields > 0) {
            player.shields--;
            player.invincibleTimer = 60;
            particles.push(...spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, 4));
          } else {
            player.lives--;
            player.invincibleTimer = GAME.INVINCIBLE_FRAMES;
            particles.push(...spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, 12));
            if (player.lives <= 0) {
              next.player = player;
              next.enemies = enemies;
              next.bullets = [...liveBullets, ...newBullets];
              next.particles = particles;
              next.score = s.score;
              next.bossHpNow = enemies.find(e => e.def.kind === 'boss')?.hp ?? 0;
              set(next);
              setTimeout(() => get().gameOver(), 800);
              return;
            }
          }
          break;
        }
      }
    }

    // ---- 道具移动与拾取 ----
    let powerUps = [...s.powerUps];
    for (let i = powerUps.length - 1; i >= 0; i--) {
      powerUps[i] = { ...powerUps[i], y: powerUps[i].y + powerUps[i].vy };
      if (powerUps[i].y > GAME.HEIGHT + 10) {
        powerUps.splice(i, 1);
        continue;
      }
      if (checkCollision({ x: powerUps[i].x, y: powerUps[i].y, w: 12, h: 12 }, { x: player.x, y: player.y, w: player.width, h: player.height })) {
        const pu = powerUps[i];
        if (pu.kind === 'bomb' && player.bombs < 5) player.bombs++;
        if (pu.kind === 'shield' && player.shields < 3) player.shields++;
        powerUps.splice(i, 1);
      }
    }

    let newScore = s.score;

    // ---- 粒子衰减 ----
    const liveParticles: Particle[] = [];
    for (const p of particles) {
      if (p.life > 0) {
        liveParticles.push({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1 });
      }
    }

    // ---- 检查波次清空 ----
    const bossAlive = enemies.find(e => e.def.kind === 'boss');
    const bossHpNow = bossAlive?.hp ?? 0;
    if (enemies.length === 0 && next.bombFlash <= 0) {
      if (s.wave >= 4) {
        set({ score: newScore, player, enemies: [], bullets: [], powerUps, particles: liveParticles, bossHpNow: 0 });
        if (s.stage >= 2) {
          setTimeout(() => get().allClear(), 500);
        } else {
          setTimeout(() => get().stageClear(), 500);
        }
        return;
      }
    }

    next.player = player;
    next.bullets = [...liveBullets, ...newBullets];
    next.enemies = enemies;
    next.powerUps = powerUps;
    next.particles = liveParticles;
    next.score = newScore;
    next.bossHpNow = bossHpNow;

    set({ ...next });
  },
}));
