// ---- 向量 ----
export interface Vec2 {
  x: number;
  y: number;
}

// ---- 游戏状态机 ----
export type GamePhase = 'main_menu' | 'playing' | 'paused' | 'game_over' | 'stage_clear' | 'all_clear';

// ---- 敌机类型枚举 ----
export type EnemyKind = 'scout' | 'fighter' | 'bomber' | 'sniper' | 'speeder' | 'boss';

// ---- 敌机定义 ----
export interface EnemyDef {
  kind: EnemyKind;
  hp: number;
  score: number;
  color: string;
  colorLight: string;
  colorDark: string;
  width: number;
  height: number;
}

// ---- 游戏中的敌机实例 ----
export interface Enemy {
  id: number;
  def: EnemyDef;
  x: number;
  y: number;
  hp: number;
  frame: number;
  phase: number;
  shotTimer: number;
  specialTimer: number;
  specialState: number;
  canShoot: boolean;
  speedX: number;
  speedY: number;
}

// ---- 子弹 ----
export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
  color: string;
}

// ---- 道具 ----
export type PowerUpKind = 'bomb' | 'shield';

export interface PowerUp {
  id: number;
  kind: PowerUpKind;
  x: number;
  y: number;
  vy: number;
}

// ---- 粒子 ----
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// ---- 玩家 ----
export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  lives: number;
  shields: number;
  bombs: number;
  fireTimer: number;
  invincibleTimer: number;
}

// ---- 波次定义 ----
export interface WaveDef {
  enemies: { kind: EnemyKind; count: number; path: 'straight' | 'zigzag' | 'hover' | 'dive' }[];
}

// ---- 关卡定义 ----
export interface StageDef {
  name: string;
  bgColors: { top: string; bottom: string };
  waves: WaveDef[];
  bossHp: number;
}

// ---- 游戏状态 (Zustand store) ----
export interface GameState {
  phase: GamePhase;
  score: number;
  hiScore: number;
  stage: number;
  wave: number;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  particles: Particle[];
  frameCount: number;
  keys: Set<string>;
  bombFlash: number;
  bossHpMax: number;
  bossHpNow: number;
  waveAdvancing: number;
}

// ---- 动作类型 (Zustand actions) ----
export interface GameActions {
  startGame: () => void;
  startStage: (stage: number) => void;
  nextWave: () => void;
  spawnBoss: () => void;
  pause: () => void;
  resume: () => void;
  gameOver: () => void;
  stageClear: () => void;
  allClear: () => void;
  toMenu: () => void;
  tick: () => void;
  setKey: (key: string, pressed: boolean) => void;
  useBomb: () => void;
}

export type GameStore = GameState & GameActions;

// ---- 颜色常量 ----
export const COLORS = {
  bg: '#1a1410',
  gold: '#f4a900',
  terra: '#c1666b',
  beige: '#d4b896',
  brown: '#4a403a',
} as const;

export const GAME = {
  WIDTH: 320,
  HEIGHT: 180,
  SCALE: 4,
  PLAYER_SPEED: 3,
  PLAYER_SLOW: 1,
  INERTIA: 0.85,
  FIRE_INTERVAL: 6,
  BOMB_CD: 30,
  INVINCIBLE_FRAMES: 120,
} as const;
