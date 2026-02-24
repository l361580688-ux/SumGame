export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME = 'TIME'
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isRemoving?: boolean;
}

export interface GameState {
  grid: Tile[];
  target: number;
  score: number;
  selectedIds: string[];
  status: GameStatus;
  mode: GameMode;
  timeLeft: number;
  highScore: number;
}
