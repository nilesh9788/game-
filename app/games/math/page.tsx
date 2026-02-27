'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Puzzle {
  id: number;
  type: 'sequence' | 'pattern' | 'match';
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface GameStats {
  totalPuzzles: number;
  correctAnswers: number;
  score: number;
  timeStarted: number;
}

export default function PuzzleGamePage() {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalPuzzles: 10,
    correctAnswers: 0,
    score: 0,
    timeStarted: 0,
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Generate puzzles based on difficulty
  const generatePuzzles = (diff: 'easy' | 'medium' | 'hard'): Puzzle[] => {
    const easyPuzzles: Puzzle[] = [
      {
        id: 1,
        type: 'sequence',
        question: 'What comes next in the sequence? 2, 4, 6, 8, ?',
        options: ['9', '10', '12', '14'],
        answer: 2,
        explanation: 'This is an arithmetic sequence where each number increases by 2.'
      },
      {
        id: 2,
        type: 'pattern',
        question: 'What is the missing number? 1, 1, 2, 3, 5, 8, ?',
        options: ['11', '13', '12', '14'],
        answer: 1,
        explanation: 'This is the Fibonacci sequence where each number is the sum of the two before it.'
      },
      {
        id: 3,
        type: 'match',
        question: 'Which shape has the most sides? Star, Circle, Triangle, Square',
        options: ['Star', 'Circle', 'Triangle', 'Square'],
        answer: 0,
        explanation: 'A star typically has 5 points making it have more sides than the others.'
      },
      {
        id: 4,
        type: 'sequence',
        question: 'What comes next? 5, 10, 15, 20, ?',
        options: ['22', '25', '30', '35'],
        answer: 2,
        explanation: 'Each number increases by 5.'
      },
      {
        id: 5,
        type: 'pattern',
        question: 'Find the missing number: 3, 6, 9, 12, ?',
        options: ['13', '14', '15', '16'],
        answer: 2,
        explanation: 'This sequence increases by 3 each time (multiples of 3).'
      },
      {
        id: 6,
        type: 'match',
        question: 'Which is a vowel? B, E, G, K',
        options: ['B', 'E', 'G', 'K'],
        answer: 1,
        explanation: 'E is the only vowel in this set. Vowels are A, E, I, O, U.'
      },
      {
        id: 7,
        type: 'sequence',
        question: 'What comes next? 1, 2, 4, 8, ?',
        options: ['12', '14', '16', '20'],
        answer: 2,
        explanation: 'Each number is multiplied by 2 (powers of 2).'
      },
      {
        id: 8,
        type: 'pattern',
        question: 'Find the pattern: 100, 50, 25, ?',
        options: ['20', '12.5', '10', '5'],
        answer: 1,
        explanation: 'Each number is divided by 2.'
      },
      {
        id: 9,
        type: 'match',
        question: 'Which color is primary? Red, Purple, Orange, Brown',
        options: ['Red', 'Purple', 'Orange', 'Brown'],
        answer: 0,
        explanation: 'Red is a primary color. Primary colors are Red, Yellow, and Blue.'
      },
      {
        id: 10,
        type: 'sequence',
        question: 'What comes next? 11, 22, 33, 44, ?',
        options: ['55', '45', '54', '56'],
        answer: 0,
        explanation: 'Each number increases by 11.'
      }
    ];

    const mediumPuzzles: Puzzle[] = [
      {
        id: 1,
        type: 'sequence',
        question: 'What comes next? 2, 5, 10, 17, ?',
        options: ['24', '26', '28', '30'],
        answer: 1,
        explanation: 'Pattern: add 3, add 5, add 7, add 9. Odd numbers increasing.'
      },
      {
        id: 2,
        type: 'pattern',
        question: 'Find the missing: 1, 4, 9, 16, 25, ?',
        options: ['30', '36', '40', '45'],
        answer: 1,
        explanation: 'Perfect squares: 1², 2², 3², 4², 5², 6²'
      },
      {
        id: 3,
        type: 'match',
        question: 'Which element is not a metal? Iron, Gold, Oxygen, Copper',
        options: ['Iron', 'Gold', 'Oxygen', 'Copper'],
        answer: 2,
        explanation: 'Oxygen is a non-metal gas. The others are metallic elements.'
      },
      {
        id: 4,
        type: 'sequence',
        question: 'What comes next? 3, 6, 12, 24, ?',
        options: ['36', '48', '60', '72'],
        answer: 1,
        explanation: 'Each number is multiplied by 2.'
      },
      {
        id: 5,
        type: 'pattern',
        question: 'Find the pattern: 2, 3, 5, 7, 11, ?',
        options: ['12', '13', '14', '15'],
        answer: 1,
        explanation: 'These are prime numbers (divisible only by 1 and themselves).'
      },
      {
        id: 6,
        type: 'match',
        question: 'Which planet is closest to the Sun? Earth, Venus, Mars, Jupiter',
        options: ['Earth', 'Venus', 'Mars', 'Jupiter'],
        answer: 1,
        explanation: 'Mercury is closest, but Venus is second closest to the Sun.'
      },
      {
        id: 7,
        type: 'sequence',
        question: 'What comes next? 1, 3, 6, 10, 15, ?',
        options: ['18', '20', '21', '24'],
        answer: 2,
        explanation: 'Triangular numbers: 1, 1+2, 1+2+3, 1+2+3+4, etc.'
      },
      {
        id: 8,
        type: 'pattern',
        question: 'Find the missing: A, B, D, E, G, H, ?',
        options: ['I', 'J', 'K', 'L'],
        answer: 2,
        explanation: 'Skip one letter, repeat pattern: A(B)D(E)G(H)J(K)'
      },
      {
        id: 9,
        type: 'match',
        question: 'Which instrument is not a string instrument? Guitar, Violin, Flute, Harp',
        options: ['Guitar', 'Violin', 'Flute', 'Harp'],
        answer: 2,
        explanation: 'Flute is a wind instrument. The others are string instruments.'
      },
      {
        id: 10,
        type: 'sequence',
        question: 'What comes next? 64, 32, 16, 8, ?',
        options: ['6', '4', '2', '1'],
        answer: 2,
        explanation: 'Each number is divided by 2 (powers of 2 in reverse).'
      }
    ];

    const hardPuzzles: Puzzle[] = [
      {
        id: 1,
        type: 'sequence',
        question: 'What comes next? 1, 1, 2, 3, 5, 8, 13, ?',
        options: ['18', '19', '20', '21'],
        answer: 3,
        explanation: 'Fibonacci sequence where each number is sum of previous two: 8+13=21'
      },
      {
        id: 2,
        type: 'pattern',
        question: 'Find the pattern: 2, 4, 8, 16, 32, ?',
        options: ['48', '62', '64', '128'],
        answer: 2,
        explanation: 'Each number is multiplied by 2 (powers of 2).'
      },
      {
        id: 3,
        type: 'match',
        question: 'Which is the odd one out? Strawberry, Banana, Carrot, Blueberry',
        options: ['Strawberry', 'Banana', 'Carrot', 'Blueberry'],
        answer: 2,
        explanation: 'Carrot is a vegetable; the others are fruits.'
      },
      {
        id: 4,
        type: 'sequence',
        question: 'What comes next? 1, 4, 10, 20, 35, ?',
        options: ['50', '52', '56', '60'],
        answer: 2,
        explanation: 'Pattern: add 3, add 6, add 10, add 15, add 21 (triangular number increments).'
      },
      {
        id: 5,
        type: 'pattern',
        question: 'Find missing: 5, 11, 23, 47, ?',
        options: ['87', '95', '99', '105'],
        answer: 0,
        explanation: 'Pattern: multiply by 2 and add 1. (5*2+1=11, 11*2+1=23, 23*2+1=47, 47*2-7=87)'
      },
      {
        id: 6,
        type: 'match',
        question: 'Which does not belong? Piano, Violin, Flute, Harp',
        options: ['Piano', 'Violin', 'Flute', 'Harp'],
        answer: 0,
        explanation: 'Piano is percussion/keyboard; others are wind/string instruments.'
      },
      {
        id: 7,
        type: 'sequence',
        question: 'What comes next? 81, 27, 9, 3, ?',
        options: ['1', '0', '2', '0.5'],
        answer: 0,
        explanation: 'Each number is divided by 3 (powers of 3 in reverse).'
      },
      {
        id: 8,
        type: 'pattern',
        question: 'Find the pattern: AEFJ, BDHK, CGIL, ?',
        options: ['CEIO', 'DFJM', 'BEID', 'FGJN'],
        answer: 1,
        explanation: 'Complex letter pattern with alphabetic progression.'
      },
      {
        id: 9,
        type: 'match',
        question: 'Which is not a programming language? Python, Java, HTML, JavaScript',
        options: ['Python', 'Java', 'HTML', 'JavaScript'],
        answer: 2,
        explanation: 'HTML is a markup language; the others are programming languages.'
      },
      {
        id: 10,
        type: 'sequence',
        question: 'What comes next? 2, 6, 12, 20, 30, ?',
        options: ['40', '42', '44', '48'],
        answer: 1,
        explanation: 'Pattern: n(n+1) where n increases. 1*2, 2*3, 3*4, 4*5, 5*6, 6*7'
      }
    ];

    switch (diff) {
      case 'easy':
        return easyPuzzles;
      case 'medium':
        return mediumPuzzles;
      case 'hard':
        return hardPuzzles;
    }
  };

  const startGame = () => {
    const newPuzzles = generatePuzzles(difficulty);
    setPuzzles(newPuzzles);
    setCurrentPuzzleIndex(0);
    setCurrentPuzzle(newPuzzles[0]);
    setStats({
      totalPuzzles: newPuzzles.length,
      correctAnswers: 0,
      score: 0,
      timeStarted: Date.now(),
    });
    setGameMode('playing');
    setSelectedAnswer(null);
    setFeedback(null);
    setAnswered(false);
  };

  useEffect(() => {
    if (gameMode === 'playing') {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - stats.timeStarted) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameMode, stats.timeStarted]);

  const handleAnswer = (answerIndex: number) => {
    if (answered) return;

    setSelectedAnswer(answerIndex);
    setAnswered(true);

    if (answerIndex === currentPuzzle?.answer) {
      setFeedback('correct');
      setStats(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        score: prev.score + 10,
      }));
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNext = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      const nextIndex = currentPuzzleIndex + 1;
      setCurrentPuzzleIndex(nextIndex);
      setCurrentPuzzle(puzzles[nextIndex]);
      setSelectedAnswer(null);
      setFeedback(null);
      setAnswered(false);
    } else {
      setGameMode('finished');
    }
  };

  const resetGame = () => {
    setGameMode('setup');
    setDifficulty('easy');
    setCurrentPuzzleIndex(0);
    setCurrentPuzzle(null);
    setPuzzles([]);
    setStats({ totalPuzzles: 10, correctAnswers: 0, score: 0, timeStarted: 0 });
    setSelectedAnswer(null);
    setFeedback(null);
    setAnswered(false);
    setTimeElapsed(0);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="mb-8 inline-block px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
          Back to Home
        </Link>

        <h1 className="text-5xl font-bold mb-4 text-center">Puzzle Game</h1>
        <p className="text-center text-neutral-400 mb-8">Solve logic puzzles and test your brain</p>

        {gameMode === 'setup' ? (
          <div className="card-game max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Choose Difficulty</h2>

            <div className="space-y-3">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                    difficulty === level
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : gameMode === 'playing' ? (
          <div className="card-game max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-neutral-400">Question {currentPuzzleIndex + 1} of {puzzles.length}</p>
                <div className="w-64 h-2 bg-neutral-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${((currentPuzzleIndex + 1) / puzzles.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-400">Time</p>
                <p className="text-2xl font-bold">{timeElapsed}s</p>
              </div>
            </div>

            <div className="space-y-6 my-8">
              <h3 className="text-xl font-bold text-center">{currentPuzzle?.question}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentPuzzle?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    className={`p-4 rounded-lg font-semibold transition-all text-center ${
                      selectedAnswer === index
                        ? feedback === 'correct'
                          ? 'bg-green-600 text-white ring-2 ring-green-400'
                          : 'bg-red-600 text-white ring-2 ring-red-400'
                        : 'bg-neutral-800 text-white hover:bg-neutral-700'
                    } ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {answered && (
                <div className={`p-4 rounded-lg text-center ${
                  feedback === 'correct'
                    ? 'bg-green-900/30 border border-green-600 text-green-400'
                    : 'bg-red-900/30 border border-red-600 text-red-400'
                }`}>
                  <p className="font-semibold mb-2">
                    {feedback === 'correct' ? 'Correct!' : 'Incorrect!'}
                  </p>
                  <p className="text-sm">{currentPuzzle?.explanation}</p>
                </div>
              )}
            </div>

            {answered && (
              <button
                onClick={handleNext}
                className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
              >
                {currentPuzzleIndex === puzzles.length - 1 ? 'Finish' : 'Next Question'}
              </button>
            )}

            <div className="flex justify-between mt-6 pt-6 border-t border-neutral-700 text-sm">
              <div>
                <p className="text-neutral-400">Correct</p>
                <p className="text-2xl font-bold text-green-400">{stats.correctAnswers}/{stats.totalPuzzles}</p>
              </div>
              <div>
                <p className="text-neutral-400">Score</p>
                <p className="text-2xl font-bold text-blue-400">{stats.score}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-game max-w-md mx-auto space-y-6 text-center">
            <h2 className="text-4xl font-bold text-green-400">Game Complete</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-neutral-800">
                <p className="text-neutral-400 mb-1">Final Score</p>
                <p className="text-5xl font-bold text-blue-400">{stats.score}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-neutral-800">
                  <p className="text-neutral-400 mb-1">Correct</p>
                  <p className="text-3xl font-bold text-green-400">{stats.correctAnswers}</p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-800">
                  <p className="text-neutral-400 mb-1">Time</p>
                  <p className="text-3xl font-bold text-yellow-400">{timeElapsed}s</p>
                </div>
              </div>

              <p className="text-neutral-400 text-sm">
                Accuracy: {Math.round((stats.correctAnswers / stats.totalPuzzles) * 100)}%
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={resetGame}
                className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
              >
                Play Again
              </button>
              <Link href="/">
                <button className="w-full px-6 py-3 rounded-lg font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-all">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
