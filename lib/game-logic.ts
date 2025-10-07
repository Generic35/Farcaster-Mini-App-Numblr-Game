import { evaluate } from 'mathjs';

export type TileState = 'correct' | 'partial' | 'incorrect' | 'empty' | 'filled';

export interface GameState {
  currentGuess: string;
  guesses: string[];
  currentRow: number;
  gameWon: boolean;
  gameLost: boolean;
  tileStates: TileState[][];
}

// Add these after the imports
export type Difficulty = 'easy' | 'medium' | 'hard';

// Seeded random number generator (same seed = same random numbers)
function seededRandom(seed: number) {
  let value = seed;
  return function () {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Get a random integer between min and max
function getRandomInt(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Generate a puzzle based on difficulty and seed (date)
export function generatePuzzle(difficulty: Difficulty, seed: number): { target: number; solution: string } {
  const random = seededRandom(seed);

  if (difficulty === 'easy') {
    // Easy: Simple addition a+b+c (all single digits)
    const a = getRandomInt(random, 1, 5);
    const b = getRandomInt(random, 1, 5);
    const c = getRandomInt(random, 0, 5);
    const target = a + b + c;
    const solution = `${a}+${b}+${c}`;
    return { target, solution };
  }

  if (difficulty === 'medium') {
    // Medium: Multiplication with subtraction a*b-c (all single digits)
    const a = getRandomInt(random, 2, 7);
    const b = getRandomInt(random, 2, 5);
    const product = a * b;
    // c must be single digit (0-9) AND less than product
    const maxC = Math.min(9, product - 1);
    const c = maxC > 0 ? getRandomInt(random, 1, maxC) : 0;
    const target = product - c;
    const solution = `${a}*${b}-${c}`;
    return { target, solution };
  }

  // Hard: Division or complex subtraction (all single digits)
  const useDiv = random() > 0.5;

  if (useDiv) {
    // Division: a/b+c or a/b-c (all must be single digits)
    const b = getRandomInt(random, 2, 4); // divisor
    const quotient = getRandomInt(random, 2, Math.min(9, Math.floor(9 / b))); // ensure a = b*quotient <= 9
    const a = b * quotient; // ensure clean division AND single digit
    const c = getRandomInt(random, 0, 9);
    const useAdd = random() > 0.5;

    const target = useAdd ? quotient + c : quotient - c;
    const solution = useAdd ? `${a}/${b}+${c}` : `${a}/${b}-${c}`;

    // Make sure target is positive and a is single digit
    if (target > 0 && a <= 9) {
      return { target, solution };
    }
  }

  // Fallback: Chain subtraction a-b-c (all single digits)
  const a = getRandomInt(random, 7, 9);
  const b = getRandomInt(random, 2, Math.min(5, a - 1));
  const c = getRandomInt(random, 1, Math.min(9, a - b));
  const target = a - b - c;
  const solution = `${a}-${b}-${c}`;

  return { target, solution };
}

// Get seed from date (day of year)
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Get today's puzzle
export function getDailyPuzzle(difficulty: Difficulty): { target: number; solution: string } {
  const today = new Date();
  const dayOfYear = getDayOfYear(today);

  // Different seed per difficulty to get different puzzles
  const difficultyOffset = { easy: 0, medium: 1000, hard: 2000 };
  const seed = dayOfYear + difficultyOffset[difficulty];

  return generatePuzzle(difficulty, seed);
}

// For testing/cycling through puzzles
export function getPuzzleForDay(difficulty: Difficulty, dayOffset: number = 0): { target: number; solution: string } {
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);
  const dayOfYear = getDayOfYear(today);

  const difficultyOffset = { easy: 0, medium: 1000, hard: 2000 };
  const seed = dayOfYear + difficultyOffset[difficulty];

  return generatePuzzle(difficulty, seed);
}

// Keep the old function for backwards compatibility but make it use generated puzzles
export function getPuzzlesByDifficulty(difficulty: Difficulty) {
  // Generate 10 puzzles for this difficulty
  return Array.from({ length: 10 }, (_, i) =>
    generatePuzzle(difficulty, i * 100 + (difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1000 : 2000))
  );
}

export const MAX_GUESSES = 6;
export const EQUATION_LENGTH = 5;

export function createInitialGameState(): GameState {
  return {
    currentGuess: "",
    guesses: [],
    currentRow: 0,
    gameWon: false,
    gameLost: false,
    tileStates: Array(MAX_GUESSES).fill(null).map(() => Array(EQUATION_LENGTH).fill('empty'))
  };
}

export function isValidCharacter(char: string): boolean {
  return /[0-9+\-*/]/.test(char);
}

export function safeEvaluateEquation(equation: string): number | null {
  try {
    // Replace display operators with math operators
    const normalizedEquation = equation.replace(/×/g, '*').replace(/÷/g, '/');
    const result = evaluate(normalizedEquation);
    return typeof result === 'number' ? result : null;
  } catch (error) {
    return null;
  }
}

export function getTileStates(guess: string, solution: string): TileState[] {
  const states: TileState[] = Array(EQUATION_LENGTH).fill('incorrect');
  const solutionChars = solution.split('');
  const guessChars = guess.split('');

  // First pass: mark correct positions (green)
  const remainingSolutionChars: string[] = [];
  const remainingGuessIndices: number[] = [];

  for (let i = 0; i < EQUATION_LENGTH; i++) {
    if (guessChars[i] === solutionChars[i]) {
      states[i] = 'correct';
    } else {
      remainingSolutionChars.push(solutionChars[i]);
      remainingGuessIndices.push(i);
    }
  }

  // Second pass: mark partial matches (yellow)
  for (const guessIndex of remainingGuessIndices) {
    const guessChar = guessChars[guessIndex];
    const solutionIndex = remainingSolutionChars.indexOf(guessChar);

    if (solutionIndex !== -1) {
      states[guessIndex] = 'partial';
      remainingSolutionChars.splice(solutionIndex, 1);
    }
  }

  return states;
}

export function checkWin(guess: string, target: number, solution: string): boolean {
  // Must evaluate to the target number
  const result = safeEvaluateEquation(guess);
  if (result !== target) return false;

  // Must be the exact solution (not just any equation that equals target)
  const normalizedGuess = guess.replace(/×/g, '*').replace(/÷/g, '/');
  const normalizedSolution = solution.replace(/×/g, '*').replace(/÷/g, '/');

  return normalizedGuess === normalizedSolution;
}

export function isCommutativeEquivalent(guess: string, solution: string): boolean {
  // Simplified check - for the MVP, we'll just check if both evaluate to the same result
  const guessResult = safeEvaluateEquation(guess);
  const solutionResult = safeEvaluateEquation(solution);
  return guessResult !== null && solutionResult !== null && guessResult === solutionResult;
}

export function addCharacterToGuess(currentGuess: string, character: string): string {
  if (currentGuess.length >= EQUATION_LENGTH) return currentGuess;
  if (!isValidCharacter(character)) return currentGuess;
  return currentGuess + character;
}

export function removeCharacterFromGuess(currentGuess: string): string {
  return currentGuess.slice(0, -1);
}

export function canSubmitGuess(guess: string): boolean {
  return guess.length === EQUATION_LENGTH && safeEvaluateEquation(guess) !== null;
}

// Share result generation functions
export interface ShareResultData {
  text: string;
  grid: string;
  attempts: number;
  won: boolean;
  puzzleNumber: number;
}

function tileStateToEmoji(state: TileState): string {
  switch (state) {
    case 'correct':
      return '🟩';
    case 'partial':
      return '🟨';
    case 'incorrect':
      return '⬜';
    default:
      return '⬜'; // fallback for empty/filled states
  }
}

export function generateShareResultData(
  gameState: GameState,
  puzzleNumber: number
): ShareResultData {
  // Only include completed rows (up to currentRow)
  const completedRows = gameState.tileStates.slice(0, gameState.currentRow);

  // Convert tile states to emoji grid
  const grid = completedRows
    .map(row => row.map(tileStateToEmoji).join(''))
    .join('\n');

  // Generate the shareable text
  const status = gameState.gameWon ? gameState.currentRow : 'X';
  const text = `🎲 Numbler #${puzzleNumber} ${status}/6\n\n${grid}`;

  return {
    text,
    grid,
    attempts: gameState.currentRow,
    won: gameState.gameWon,
    puzzleNumber
  };
}

// Helper to get current puzzle number (day of year)
export function getCurrentPuzzleNumber(): number {
  return getDayOfYear(new Date());
}

// Generate shareable Frame URL
export function generateShareUrl(resultData: ShareResultData): string {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  // Encode result data as base64 to include in URL
  const encodedData = Buffer.from(JSON.stringify({
    attempts: resultData.attempts,
    grid: resultData.grid,
    puzzleNumber: resultData.puzzleNumber,
    won: resultData.won
  })).toString('base64');

  return `${appUrl}/share/${encodedData}`;
}
