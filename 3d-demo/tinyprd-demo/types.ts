
export enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  GAMEOVER
}

export enum EnemyType {
  MINION,
  RUNNER,
  BRUTE
}

export interface Point {
  x: number;
  z: number;
}

export interface Entity {
  id: string;
  x: number;
  z: number;
  radius: number;
  hp: number;
}

export interface Player extends Entity {
  vx: number;
  vz: number;
  lastShootTime: number;
  invulnerableUntil: number;
  lean: { x: number; z: number };
}

export interface Enemy extends Entity {
  type: EnemyType;
  speed: number;
  damage: number;
  moveAxis: 'x' | 'z';
  commitTime: number;
}

export interface Projectile extends Entity {
  vx: number;
  vz: number;
  birth: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}
