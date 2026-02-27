'use client';

import { useState } from 'react';

interface CubeInputProps {
  onSubmit: (colors: string[]) => void;
}

const FACES = ['Front', 'Back', 'Up', 'Down', 'Left', 'Right'];
const COLORS = [
  { name: 'White', value: 'white', class: 'bg-white' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-400' },
  { name: 'Red', value: 'red', class: 'bg-red-600' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-600' },
  { name: 'Green', value: 'green', class: 'bg-green-600' },
];

export default function CubeInput({ onSubmit }: CubeInputProps) {
  const [selectedFace, setSelectedFace] = useState(0);
  const [faceColors, setFaceColors] = useState<string[][]>(
    Array(6).fill(null).map(() => Array(9).fill('white'))
  );

  const handleColorClick = (position: number, color: string) => {
    const newFaceColors = faceColors.map(f => [...f]);
    newFaceColors[selectedFace][position] = color;
    setFaceColors(newFaceColors);
  };

  const validateCube = (): { valid: boolean; message: string } => {
    const allColors = faceColors.flat();
    
    // Check if all squares are filled
    if (allColors.some(c => !c)) {
      return { valid: false, message: 'All squares must be filled' };
    }

    // Check if each color appears exactly 9 times
    const colorCounts: { [key: string]: number } = {};
    allColors.forEach(color => {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });

    const validColors = COLORS.map(c => c.value);
    for (const color of validColors) {
      if (!colorCounts[color] || colorCounts[color] !== 9) {
        return { 
          valid: false, 
          message: `Each color must appear exactly 9 times. ${color} appears ${colorCounts[color] || 0} times` 
        };
      }
    }

    return { valid: true, message: '' };
  };

  const handleSubmit = () => {
    const validation = validateCube();
    if (validation.valid) {
      onSubmit(faceColors.flat());
    } else {
      alert(validation.message);
    }
  };

  const handleReset = () => {
    setFaceColors(Array(6).fill(null).map(() => Array(9).fill('white')));
  };

  return (
    <div className="card-game space-y-6">
      <h2 className="text-2xl font-bold">Input Cube Colors</h2>

      {/* Face selector */}
      <div className="grid grid-cols-3 gap-2">
        {FACES.map((face, idx) => (
          <button
            key={face}
            onClick={() => setSelectedFace(idx)}
            className={`py-2 rounded-lg font-semibold transition-all ${
              selectedFace === idx
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {face}
          </button>
        ))}
      </div>

      {/* 3x3 Grid for current face */}
      <div className="bg-neutral-800/50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {faceColors[selectedFace].map((color, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded-lg border-2 border-neutral-700 cursor-pointer hover:border-neutral-500 transition-all ${
                COLORS.find(c => c.value === color)?.class || 'bg-gray-400'
              }`}
              onClick={() => {
                // Show color picker by cycling through colors
                const currentIdx = COLORS.findIndex(c => c.value === color);
                const nextColor = COLORS[(currentIdx + 1) % COLORS.length];
                handleColorClick(idx, nextColor.value);
              }}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-400">Click blocks to cycle through colors</p>
      </div>

      {/* Color palette */}
      <div className="space-y-2">
        <p className="text-sm text-neutral-400">Quick color select:</p>
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map(color => (
            <button
              key={color.value}
              onClick={() => {
                const newFaceColors = faceColors.map(f => [...f]);
                newFaceColors[selectedFace] = newFaceColors[selectedFace].map(() => color.value);
                setFaceColors(newFaceColors);
              }}
              className={`py-2 rounded-lg text-xs font-semibold ${color.class} text-black hover:opacity-80 transition-all`}
            >
              Fill with {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
        >
          Reset All
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Solve Cube
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        Each face has 9 squares. Fill all 6 faces with colors to solve.
      </p>
    </div>
  );
}
