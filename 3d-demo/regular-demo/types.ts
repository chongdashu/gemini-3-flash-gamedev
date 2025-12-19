
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Enemy {
  id: string;
  type: 'cube' | 'wisp' | 'ball';
  position: Position;
  health: number;
  speed: number;
  direction: Direction;
}

export interface Snowball {
  id: string;
  position: Position;
  direction: Direction;
  speed: number;
}

export interface GameState {
  score: number;
  health: number;
  wave: number;
  isGameOver: boolean;
  highScore: number;
  waveMessage: string;
}
