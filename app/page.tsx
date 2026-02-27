'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const games = [
    {
      id: 'rubiks-cube',
      title: 'Rubik\'s Cube Solver',
      description: 'Input your cube colors and get step-by-step solutions with animations',
      icon: 'C',
      color: 'from-cyan-500 to-blue-600',
      featured: true,
      soon: false,
    },
    {
      id: 'chess',
      title: 'Chess',
      description: 'Play chess against another player on the same device',
      icon: 'K',
      color: 'from-purple-500 to-pink-600',
      featured: false,
      soon: false,
    },
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe',
      description: 'Classic 3x3 grid game. Can you beat the AI?',
      icon: 'X',
      color: 'from-green-500 to-emerald-600',
      featured: false,
      soon: false,
    },
    {
      id: 'ludo',
      title: 'Ludo',
      description: 'Race your pieces to victory in this classic board game',
      icon: 'L',
      color: 'from-yellow-500 to-orange-600',
      featured: false,
      soon: false,
    },
    {
      id: 'snake',
      title: 'Snake Game',
      description: 'Guide the snake, eat pellets, and avoid hitting walls',
      icon: 'S',
      color: 'from-lime-500 to-green-600',
      featured: false,
      soon: false,
    },
    {
      id: 'math',
      title: 'Math Challenge',
      description: 'Test your math skills with quick calculations',
      icon: 'M',
      color: 'from-red-500 to-pink-600',
      featured: false,
      soon: true,
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              GameHub
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="relative z-10 pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Welcome to <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">GameHub</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 mb-8 text-balance">
            Play mind-bending games, solve the Rubik's Cube with AI assistance, and challenge your friends
          </p>
        </div>
      </div>

      {/* Featured Game */}
      <section className="relative z-10 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <Link href="/games/rubiks-cube">
            <div className="group cursor-pointer mb-16">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 p-1">
                <div className="bg-neutral-950 rounded-xl p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="text-6xl mb-4">🎲</div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4">Rubik's Cube Solver</h2>
                      <p className="text-neutral-300 text-lg mb-6">
                        Input all six faces of your Rubik's Cube with colors, and our intelligent solver will provide step-by-step animated solutions to solve it. Watch as each move is visualized in 3D!
                      </p>
                      <div className="group-hover:translate-x-2 transition-transform">
                        <button className="px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95">
                          Start Solving →
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl rotate-12 group-hover:rotate-6 transition-transform duration-300 flex items-center justify-center text-8xl">
                        🎲
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Games Grid */}
      <section className="relative z-10 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">More Games</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              game.featured ? null : (
                <Link key={game.id} href={game.soon ? '#' : `/games/${game.id}`}>
                  <div
                    className="card-game group relative cursor-pointer"
                    onMouseEnter={() => setHoveredGame(game.id)}
                    onMouseLeave={() => setHoveredGame(null)}
                  >
                    {/* Background gradient effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

                    <div className="relative z-10">
                      <div className="text-5xl mb-4 font-bold text-white">{game.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                      <p className="text-neutral-400 text-sm mb-4">{game.description}</p>

                      {game.soon ? (
                        <div className="inline-block px-3 py-1 bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-full">
                          Coming Soon
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-3 transition-all">
                          Play Now <span>→</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800 mt-20 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-neutral-500">
          <p>GameHub - Play, Learn, Challenge Yourself</p>
          <p className="text-sm mt-2">© 2024. All games available offline on your device.</p>
        </div>
      </footer>
    </main>
  );
}
