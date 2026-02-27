'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  num1: number;
  num2: number;
  operation: '+' | '-' | '*' | '/';
  answer: number;
}

interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeElapsed: number;
}

export default function MathChallengePage() {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalQuestions: 10,
    correctAnswers: 0,
    score: 0,
    timeElapsed: 0,
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameTimer, setGameTimer] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [answered, setAnswered] = useState(false);

  // Generate random question based on difficulty
  const generateQuestion = (index: number, diff: 'easy' | 'medium' | 'hard'): Question => {
    let num1, num2, operation;
    
    switch (diff) {
      case 'easy':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operation = ['+', '-'][Math.floor(Math.random() * 2)] as '+' | '-';
        break;
      case 'medium':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        operation = ['+', '-', '*'][Math.floor(Math.random() * 3)] as '+' | '-' | '*';
        break;
      case 'hard':
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operation = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)] as '+' | '-' | '*' | '/';
        if (operation === '/' && num2 === 0) num2 = 1;
        break;
      default:
        num1 = 5;
        num2 = 3;
        operation = '+';
    }

    let answer = 0;
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      case '/':
        answer = Math.floor(num1 / num2);
        break;
    }

    return {
      id: index,
      num1,
      num2,
      operation,
      answer,
    };
  };

  const generateQuestions = (diff: 'easy' | 'medium' | 'hard') => {
    const qs = Array(10)
      .fill(0)
      .map((_, i) => generateQuestion(i, diff));
    setQuestions(qs);
    setCurrentQuestion(qs[0]);
    setCurrentQuestionIndex(0);
    setStats({ totalQuestions: 10, correctAnswers: 0, score: 0, timeElapsed: 0 });
    setTimeLeft(30);
  };

  // Timer for each question
  useEffect(() => {
    if (gameMode !== 'playing' || answered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, answered]);

  // Game timer
  useEffect(() => {
    if (gameMode !== 'playing') return;

    const timer = setInterval(() => {
      setGameTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode]);

  const handleTimeout = () => {
    if (!answered && currentQuestion) {
      setFeedback('incorrect');
      setAnswered(true);
    }
  };

  const handleAnswer = () => {
    if (!currentQuestion || answered || !userAnswer) return;

    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentQuestion.answer;

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setAnswered(true);

    if (isCorrect) {
      setStats((prev) => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        score: prev.score + (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : 50) + Math.max(0, timeLeft * 2),
      }));
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestion(questions[nextIndex]);
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer('');
      setFeedback(null);
      setAnswered(false);
      setTimeLeft(30);
    } else {
      setGameMode('finished');
    }
  };

  const handleStartGame = () => {
    generateQuestions(difficulty);
    setGameMode('playing');
    setGameTimer(0);
  };

  const handleRestartGame = () => {
    setGameMode('setup');
    setUserAnswer('');
    setFeedback(null);
    setAnswered(false);
    setCurrentQuestion(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            ← Back to GameHub
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-2">Math Challenge</h1>
        <p className="text-neutral-400 mb-12">Answer math questions as quickly as possible to earn points</p>

        {gameMode === 'setup' ? (
          <div className="card-game max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Select Difficulty</h2>

            <div className="space-y-3">
              <div
                onClick={() => setDifficulty('easy')}
                className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                  difficulty === 'easy'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <h3 className="font-bold text-green-400 mb-1">Easy</h3>
                <p className="text-sm text-neutral-400">Addition & Subtraction (1-10)</p>
                <p className="text-xs text-neutral-500 mt-2">+10 points per correct answer</p>
              </div>

              <div
                onClick={() => setDifficulty('medium')}
                className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                  difficulty === 'medium'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <h3 className="font-bold text-yellow-400 mb-1">Medium</h3>
                <p className="text-sm text-neutral-400">All operations (1-50)</p>
                <p className="text-xs text-neutral-500 mt-2">+25 points per correct answer</p>
              </div>

              <div
                onClick={() => setDifficulty('hard')}
                className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                  difficulty === 'hard'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <h3 className="font-bold text-red-400 mb-1">Hard</h3>
                <p className="text-sm text-neutral-400">All operations with large numbers (1-100)</p>
                <p className="text-xs text-neutral-500 mt-2">+50 points per correct answer</p>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Challenge
            </button>
          </div>
        ) : gameMode === 'playing' && currentQuestion ? (
          <div className="space-y-6">
            {/* Progress and Stats */}
            <div className="card-game">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-neutral-400 mb-1">Question</div>
                  <div className="text-3xl font-bold">
                    {currentQuestionIndex + 1}/{stats.totalQuestions}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-neutral-400 mb-1">Score</div>
                  <div className="text-3xl font-bold text-yellow-400">{stats.score}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-neutral-400 mb-1">Time Left</div>
                  <div className={`text-3xl font-bold ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                    {timeLeft}s
                  </div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="card-game max-w-md mx-auto space-y-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-400 mb-4 font-mono">
                  {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2}
                </div>
                <p className="text-neutral-400">What is the answer?</p>
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !answered && handleAnswer()}
                  disabled={answered}
                  placeholder="Enter your answer"
                  autoFocus
                  className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-700 rounded-lg text-center text-2xl font-bold text-neutral-50 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />

                {!answered ? (
                  <button
                    onClick={handleAnswer}
                    disabled={!userAnswer}
                    className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Next Question →
                  </button>
                )}
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`p-4 rounded-lg text-center font-bold text-lg ${
                    feedback === 'correct'
                      ? 'bg-green-900/50 border border-green-500 text-green-300'
                      : 'bg-red-900/50 border border-red-500 text-red-300'
                  }`}
                >
                  {feedback === 'correct' ? (
                    <>
                      ✓ Correct! Answer: {currentQuestion.answer}
                    </>
                  ) : (
                    <>
                      ✗ Wrong! Correct answer: {currentQuestion.answer}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Game Over Screen */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-neutral-900 border-2 border-green-500 rounded-xl p-8 max-w-md w-full text-center space-y-6 animate-bounce">
                <h2 className="text-4xl font-bold text-green-400">Challenge Complete!</h2>

                <div className="space-y-4">
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <div className="text-sm text-neutral-400 mb-1">Final Score</div>
                    <div className="text-5xl font-bold text-yellow-400">{stats.score}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-800 rounded-lg p-4">
                      <div className="text-xs text-neutral-400 mb-1">Correct</div>
                      <div className="text-2xl font-bold text-green-400">
                        {stats.correctAnswers}/{stats.totalQuestions}
                      </div>
                    </div>
                    <div className="bg-neutral-800 rounded-lg p-4">
                      <div className="text-xs text-neutral-400 mb-1">Accuracy</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-neutral-400">
                    Time: {formatTime(gameTimer)}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleRestartGame}
                    className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Play Again
                  </button>
                  <Link href="/" className="block">
                    <button className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95">
                      Back to Home
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
