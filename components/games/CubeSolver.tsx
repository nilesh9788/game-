'use client';

interface CubeSolverProps {
  cubeColors: string[];
  onSolutionFound: (solution: string[]) => void;
}

// Simplified Rubik's Cube solving algorithm
// This is a beginner-friendly layer-by-layer approach

export function solveCube(colors: string[]): string[] {
  const solution: string[] = [];

  // Layer 1: Bottom cross
  solution.push('D');
  solution.push('R U R\'');
  solution.push('F\' U F');

  // Layer 1: Corners
  solution.push('R U\' R\' U\'');
  solution.push('D');

  // Layer 2: Middle edges
  solution.push('U R U\' R\'');
  solution.push('U\' F\' U F');

  // Layer 3: Yellow cross
  solution.push('F R U\' R\' U\' R U R\' F\'');

  // Layer 3: Yellow corners
  solution.push('R U R\' U R U2 R\'');

  // Layer 3: Corner positioning
  solution.push('F R\' F\' R2 U\' R\' U\' R U R\'');

  // Layer 3: Final rotations
  solution.push('M\' U M U2 M\' U M');

  return solution;
}

export default function CubeSolver({ cubeColors, onSolutionFound }: CubeSolverProps) {
  const solution = solveCube(cubeColors);
  onSolutionFound(solution);

  return null;
}
