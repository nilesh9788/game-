'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

export default function SnakePage() {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    let isOnSnake = true;
    
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOnSnake = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
    }
    
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (isPaused || gameMode !== 'playing') return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      if (nextDirection === 'UP') head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
      if (nextDirection === 'DOWN') head.y = (head.y + 1) % GRID_SIZE;
      if (nextDirection === 'LEFT') head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
      if (nextDirection === 'RIGHT') head.x = (head.x + 1) % GRID_SIZE;

      // Check collision with self
      if (newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameMode('finished');
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check if food eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      setDirection(nextDirection);
      return newSnake;
    });
  }, [nextDirection, food, generateFood, isPaused, gameMode]);

  useEffect(() => {
    if (gameMode !== 'playing' || isPaused) return;
    
    const interval = setInterval(moveSnake, 200);
    return () => clearInterval(interval);
  }, [moveSnake, gameMode, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameMode !== 'playing') return;
      
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        if (direction !== 'DOWN') setNextDirection('UP');
      } else if (key === 'arrowdown' || key === 's') {
        if (direction !== 'UP') setNextDirection('DOWN');
      } else if (key === 'arrowleft' || key === 'a') {
        if (direction !== 'RIGHT') setNextDirection('LEFT');
      } else if (key === 'arrowright' || key === 'd') {
        if (direction !== 'LEFT') setNextDirection('RIGHT');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameMode, direction]);

  const startGame = () => {
    setGameMode('playing');
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection('UP');
    setNextDirection('UP');
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const resetGame = () => {
    startGame();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="mb-8 inline-block px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
          Back to Home
        </Link>

        <h1 className="text-5xl font-bold mb-4 text-center text-green-400">Snake Game</h1>
        <p className="text-center text-neutral-400 mb-8">Use arrow keys or WASD to control the snake. Eat food to grow and gain points!</p>

        {gameMode === 'finished' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border-2 border-red-500 rounded-xl p-8 max-w-md w-full text-center space-y-6 animate-pulse">
              <h2 className="text-4xl font-bold text-red-400">Game Over!</h2>
              <p className="text-2xl text-white font-semibold">Final Score: {score}</p>
              <div className="space-y-3">
                <button
                  onClick={resetGame}
                  className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Play Again
                </button>
                <a href="/" className="block">
                  <button className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95">
                    Back to Home
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}

        {gameMode === 'setup' ? (
          <div className="card-game max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Game Instructions</h2>
            <ul className="space-y-2 text-neutral-400">
              <li>- Use Arrow Keys or WASD to move</li>
              <li>- Eat food to grow and score points</li>
              <li>- Avoid hitting walls or yourself</li>
              <li>- Each food = 10 points</li>
            </ul>
            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Score Display */}
            <div className="card-game">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Score: {score}</h3>
                <div className="space-x-2">
                  <button
                    onClick={togglePause}
                    className="px-4 py-2 rounded-lg font-bold bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                </div>
              </div>
            </div>

            {/* Game Grid */}
            <div className="card-game flex justify-center">
              <div className="relative border-2 border-neutral-600" style={{ width: '400px', height: '400px' }}>
                {/* Grid background */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array(GRID_SIZE * GRID_SIZE)
                    .fill(0)
                    .map((_, idx) => (
                      <div key={idx} className="border border-neutral-800"></div>
                    ))}
                </div>

                {/* Snake */}
                {snake.map((segment, idx) => (
                  <div
                    key={idx}
                    className={`absolute w-5 h-5 rounded-sm ${idx === 0 ? 'bg-green-500' : 'bg-green-400'}`}
                    style={{
                      left: `${(segment.x / GRID_SIZE) * 100}%`,
                      top: `${(segment.y / GRID_SIZE) * 100}%`,
                      width: `${100 / GRID_SIZE}%`,
                      height: `${100 / GRID_SIZE}%`,
                    }}
                  ></div>
                ))}

                {/* Food */}
                <div
                  className="absolute w-5 h-5 bg-red-500 rounded-full"
                  style={{
                    left: `${(food.x / GRID_SIZE) * 100}%`,
                    top: `${(food.y / GRID_SIZE) * 100}%`,
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Controls Info */}
            <div className="card-game text-center">
              <p className="text-neutral-400">
                {isPaused ? 'PAUSED - Press Resume to continue' : 'Use Arrow Keys or WASD to move'}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
