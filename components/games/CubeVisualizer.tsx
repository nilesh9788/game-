'use client';

import { useEffect, useState } from 'react';

interface CubeVisualizerProps {
  cubeState: string[];
  currentStep: number;
  solution: string[];
}

export default function CubeVisualizer({ cubeState, currentStep, solution }: CubeVisualizerProps) {
  const [rotation, setRotation] = useState({ x: 20, y: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x + 0.5,
        y: prev.y + 0.8,
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'white': 'bg-white',
      'yellow': 'bg-yellow-400',
      'red': 'bg-red-600',
      'orange': 'bg-orange-500',
      'blue': 'bg-blue-600',
      'green': 'bg-green-600',
    };
    return colorMap[colorName] || 'bg-gray-400';
  };

  return (
    <div className="card-game space-y-6">
      <h3 className="text-xl font-bold">Cube Visualization</h3>

      {/* 3D-like cube representation */}
      <div className="flex justify-center items-center py-12 bg-neutral-800/30 rounded-lg overflow-hidden">
        <div
          className="w-48 h-48 relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: 'none',
          } as React.CSSProperties}
        >
          {/* Cube faces */}
          {[0, 1, 2, 3, 4, 5].map((faceIdx) => (
            <div
              key={faceIdx}
              className="absolute w-48 h-48"
              style={{
                transformStyle: 'preserve-3d',
                transform: [
                  'translateZ(96px)', // Front
                  'rotateY(180deg) translateZ(96px)', // Back
                  'rotateX(90deg) translateZ(96px)', // Top
                  'rotateX(-90deg) translateZ(96px)', // Bottom
                  'rotateY(-90deg) translateZ(96px)', // Left
                  'rotateY(90deg) translateZ(96px)', // Right
                ][faceIdx],
              } as React.CSSProperties}
            >
              {/* Individual stickers */}
              <div className="grid grid-cols-3 gap-1 w-full h-full p-2 bg-neutral-900/50">
                {cubeState.slice(faceIdx * 9, faceIdx * 9 + 9).map((color, idx) => (
                  <div
                    key={idx}
                    className={`${getColorClass(color)} rounded border border-black shadow-lg`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Move indicator */}
      {solution.length > 0 && (
        <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
          <p className="text-sm text-neutral-400">Current move:</p>
          <p className="text-2xl font-bold text-blue-400">{solution[currentStep]}</p>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-neutral-500 text-center">
        Cube rotates automatically to show all faces
      </p>
    </div>
  );
}
