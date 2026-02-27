'use client';

import { useState, useEffect } from 'react';
import CubeInput from '@/components/games/CubeInput';
import { solveCube } from '@/components/games/CubeSolver';
import CubeVisualizer from '@/components/games/CubeVisualizer';

export default function RubiksCubePage() {
  const [cubeState, setCubeState] = useState<string[]>([]);
  const [solution, setSolution] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const handleCubeSubmit = (colors: string[]) => {
    setCubeState(colors);
    const solvedSteps = solveCube(colors);
    setSolution(solvedSteps);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentStep < solution.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <a href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            ← Back to GameHub
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Rubik's Cube Solver</h1>
        <p className="text-neutral-400 mb-12">Enter your cube colors below to get a step-by-step solution</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <CubeInput onSubmit={handleCubeSubmit} />
          </div>

          {/* Visualizer and Controls */}
          <div className="lg:col-span-2">
            {cubeState.length > 0 ? (
              <div className="space-y-8">
                <CubeVisualizer cubeState={cubeState} currentStep={currentStep} solution={solution} />

                {solution.length > 0 && (
                  <div className="card-game space-y-4">
                    <h3 className="text-xl font-bold">Solution ({solution.length} moves)</h3>
                    <div className="space-y-3">
                      <div className="text-sm text-neutral-400">
                        Step {currentStep + 1} of {solution.length}
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {solution[currentStep]}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handlePreviousStep}
                        disabled={currentStep === 0}
                        className="flex-1 px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={currentStep >= solution.length - 1}
                        className="flex-1 px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-game text-center py-12">
                <p className="text-neutral-400">Enter your cube colors on the left to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
