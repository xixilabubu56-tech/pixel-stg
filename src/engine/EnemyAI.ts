import type { EnemyDef } from '../types';

export const enemyDefs: Record<string, EnemyDef> = {
  scout: {
    kind: 'scout', hp: 1, score: 100,
    color: '#8bc34a', colorLight: '#c5e1a5', colorDark: '#558b2f',
    width: 16, height: 16,
  },
  fighter: {
    kind: 'fighter', hp: 2, score: 200,
    color: '#ef5350', colorLight: '#ffcdd2', colorDark: '#b71c1c',
    width: 16, height: 16,
  },
  bomber: {
    kind: 'bomber', hp: 4, score: 500,
    color: '#ff9800', colorLight: '#ffe0b2', colorDark: '#e65100',
    width: 24, height: 24,
  },
  sniper: {
    kind: 'sniper', hp: 3, score: 350,
    color: '#ba68c8', colorLight: '#e1bee7', colorDark: '#7b1fa2',
    width: 16, height: 18,
  },
  speeder: {
    kind: 'speeder', hp: 2, score: 300,
    color: '#4dd0e1', colorLight: '#e0f7fa', colorDark: '#006064',
    width: 16, height: 18,
  },
  boss: {
    kind: 'boss', hp: 40, score: 5000,
    color: '#b71c1c', colorLight: '#ffcdd2', colorDark: '#4a148c',
    width: 48, height: 36,
  },
};
