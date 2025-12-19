
export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 540;
export const LANE_GRID = 48;

export const PLAYER_SPEED = 320;
export const PLAYER_ACCEL = 2400;
export const PLAYER_DECEL = 2800;
export const PLAYER_RADIUS = 18;
export const PLAYER_FORGIVE = 3;

export const PROJECTILE_SPEED = 520;
export const FIRE_RATE = 6; // shots per sec
export const FIRE_COOLDOWN = 1 / FIRE_RATE;
export const PROJECTILE_LIFE = 1.25;

export const COLORS = {
  BG: 0x0B1B2B,
  FLOOR: 0x16324A,
  GRID: 0x214B6B,
  PLAYER: 0xF3FBFF,
  SCARF: 0xE43D4C,
  MINION: 0xD7F1FF,
  RUNNER: 0x6FD3FF,
  BRUTE: 0x9ED0E6,
  PROJECTILE: 0xFFFFFF,
  DAMAGE: 0xFF4D5A,
  NEAR_MISS: 0xB8F3FF,
  MILESTONE: 0xC9FFF4
};

export const ENEMY_STATS = {
  MINION: { radius: 14, speed: 110, hp: 1, damage: 10, score: 10 },
  RUNNER: { radius: 12, speed: 190, hp: 1, damage: 12, score: 15 },
  BRUTE: { radius: 22, speed: 70, hp: 5, damage: 20, score: 40 }
};

export const STORAGE_KEYS = {
  HIGH_SCORE: 'snowmanSentinel_highScore',
  BEST_WAVE: 'snowmanSentinel_bestWave'
};
