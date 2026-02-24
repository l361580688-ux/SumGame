import { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, GameStatus, Tile } from './types';

const COLS = 6;
const ROWS = 10;
const INITIAL_ROWS = 4;
const TICK_RATE = 1000;
const TIME_LIMIT = 10; // Seconds per row in Time Mode

export const useGameLogic = () => {
  const [grid, setGrid] = useState<Tile[]>([]);
  const [target, setTarget] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('sumstack_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a random tile
  const generateTile = (row: number, col: number): Tile => ({
    id: Math.random().toString(36).substr(2, 9),
    value: Math.floor(Math.random() * 9) + 1,
    row,
    col,
  });

  // Generate a new row at the bottom
  const addNewRow = useCallback(() => {
    setGrid(prev => {
      // Check if any tile is at the top (row 0)
      const isFull = prev.some(t => t.row === 0);
      if (isFull) {
        setStatus(GameStatus.GAMEOVER);
        return prev;
      }

      // Shift existing tiles up
      const shifted = prev.map(t => ({ ...t, row: t.row - 1 }));
      
      // Add new row at the bottom (ROWS - 1)
      const newRow: Tile[] = [];
      for (let c = 0; c < COLS; c++) {
        newRow.push(generateTile(ROWS - 1, c));
      }
      
      return [...shifted, ...newRow];
    });
    
    if (mode === GameMode.TIME) {
      setTimeLeft(TIME_LIMIT);
    }
  }, [mode]);

  // Generate a reasonable target
  const generateTarget = useCallback((currentGrid: Tile[]) => {
    if (currentGrid.length === 0) return 10;
    
    // Pick a few random tiles to sum up for a guaranteed solvable target
    // Or just pick a random number between 10 and 25
    const newTarget = Math.floor(Math.random() * 16) + 10; // 10 to 25
    setTarget(newTarget);
  }, []);

  const startGame = (selectedMode: GameMode) => {
    const initialGrid: Tile[] = [];
    for (let r = ROWS - INITIAL_ROWS; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        initialGrid.push(generateTile(r, c));
      }
    }
    setGrid(initialGrid);
    setScore(0);
    setSelectedIds([]);
    setMode(selectedMode);
    setStatus(GameStatus.PLAYING);
    setTimeLeft(TIME_LIMIT);
    generateTarget(initialGrid);
  };

  const selectTile = (id: string) => {
    if (status !== GameStatus.PLAYING) return;

    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  // Handle selection logic
  useEffect(() => {
    if (selectedIds.length === 0) return;

    const selectedTiles = grid.filter(t => selectedIds.includes(t.id));
    const currentSum = selectedTiles.reduce((sum, t) => sum + t.value, 0);

    if (currentSum === target) {
      // Success!
      setScore(prev => prev + (selectedIds.length * 10));
      setGrid(prev => prev.filter(t => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      generateTarget(grid.filter(t => !selectedIds.includes(t.id)));
      
      if (mode === GameMode.CLASSIC) {
        addNewRow();
      }
    } else if (currentSum > target) {
      // Failed - clear selection
      setSelectedIds([]);
    }
  }, [selectedIds, target, grid, mode, addNewRow, generateTarget]);

  // Timer for Time Mode
  useEffect(() => {
    if (status === GameStatus.PLAYING && mode === GameMode.TIME) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            addNewRow();
            return TIME_LIMIT;
          }
          return prev - 1;
        });
      }, TICK_RATE);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, mode, addNewRow]);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('sumstack_highscore', score.toString());
    }
  }, [score, highScore]);

  return {
    grid,
    target,
    score,
    selectedIds,
    status,
    mode,
    timeLeft,
    highScore,
    startGame,
    selectTile,
    reset: () => setStatus(GameStatus.MENU)
  };
};
