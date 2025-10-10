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

// For text sharing (cast text)
function tileStateToTextEmoji(state: TileState): string {
  switch (state) {
    case 'correct':
      return '🟩';
    case 'partial':
      return '🟨';
    case 'incorrect':
      return '⬛'; // black square for text grid
    default:
      return '⬛'; // fallback for empty/filled states - black square for text grid
  }
}

// For OG image generation (Frame image)
function tileStateToEmoji(state: TileState): string {
  switch (state) {
    case 'correct':
      return '🟩';
    case 'partial':
      return '🟨';
    case 'incorrect':
      return '⬜'; // white square for OG image
    default:
      return '⬜'; // fallback for empty/filled states - white square for OG image
  }
}

export function generateShareResultData(
  gameState: GameState,
  puzzleNumber: number
): ShareResultData {
  // Only include completed rows (up to currentRow)
  const completedRows = gameState.tileStates.slice(0, gameState.currentRow);

  // Convert tile states to emoji grid for OG image (Frame)
  const grid = completedRows
    .map(row => row.map(tileStateToEmoji).join(''))
    .join('\n');

  // Convert tile states to emoji grid for text sharing (cast text)
  const textGrid = completedRows
    .map(row => row.map(tileStateToTextEmoji).join(''))
    .join('\n');

  // Generate the shareable text with emoji grid
  const text = gameState.gameWon
    ? `🎲 I just solved Numbler #${puzzleNumber} in ${gameState.currentRow} attempts!\n\nThink you can beat me???\n\n${textGrid}`
    : `🎲 I couldn't solve Numbler #${puzzleNumber} today... better luck next time!\n\nCan you solve it???\n\n${textGrid}`;

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
  const appUrl = (process.env.NEXT_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');

  // Create compact grid representation for OG image
  const compactGrid = resultData.grid
    .replace(/🟩/g, 'C')  // green -> C
    .replace(/🟨/g, 'P')  // yellow -> P  
    .replace(/⬜/g, 'I')  // white square (OG image) -> I
    .replace(/⬛/g, 'I')  // black square (text) -> I  
    .replace(/\n/g, '|'); // newlines -> |


  // Encode minimal result data to keep URL short for Farcaster limits
  const encodedData = Buffer.from(JSON.stringify({
    a: resultData.attempts,     // shortened key
    p: resultData.puzzleNumber, // shortened key  
    w: resultData.won,          // shortened key
    g: compactGrid              // compact grid for OG image
  })).toString('base64')
    .replace(/\+/g, '-')  // Replace + with -
    .replace(/\//g, '_')  // Replace / with _
    .replace(/=/g, '');   // Remove padding =

  return `${appUrl}/share/${encodedData}?v=2`; // Cache busting for fixed OG images
}

// ===== VALIDATION FUNCTIONS FOR PERSISTENCE =====

/**
 * Validate that a loaded game state has the correct structure and values
 */
export function isValidGameState(gameState: any): gameState is GameState {
  if (!gameState || typeof gameState !== 'object') {
    console.warn('Invalid game state: not an object');
    return false;
  }

  // Check all required properties exist with correct types
  const requiredProps = {
    currentGuess: 'string',
    guesses: 'object', // array
    currentRow: 'number',
    gameWon: 'boolean',
    gameLost: 'boolean',
    tileStates: 'object' // array
  };

  for (const [prop, expectedType] of Object.entries(requiredProps)) {
    if (!(prop in gameState) || typeof gameState[prop] !== expectedType) {
      console.warn(`Invalid game state: ${prop} is missing or wrong type`);
      return false;
    }
  }

  // Validate arrays are actually arrays
  if (!Array.isArray(gameState.guesses) || !Array.isArray(gameState.tileStates)) {
    console.warn('Invalid game state: guesses or tileStates not arrays');
    return false;
  }

  // Validate currentRow is within bounds (0-6)
  if (gameState.currentRow < 0 || gameState.currentRow > 6) {
    console.warn(`Invalid game state: currentRow ${gameState.currentRow} out of bounds`);
    return false;
  }

  // Validate guesses array length matches currentRow
  if (gameState.guesses.length !== gameState.currentRow) {
    console.warn(`Invalid game state: guesses length ${gameState.guesses.length} doesn't match currentRow ${gameState.currentRow}`);
    return false;
  }

  // Validate tileStates array dimensions (6x5)
  if (gameState.tileStates.length !== 6) {
    console.warn(`Invalid game state: tileStates should have 6 rows, has ${gameState.tileStates.length}`);
    return false;
  }

  for (let i = 0; i < gameState.tileStates.length; i++) {
    if (!Array.isArray(gameState.tileStates[i]) || gameState.tileStates[i].length !== 5) {
      console.warn(`Invalid game state: tileStates row ${i} should have 5 columns`);
      return false;
    }
  }

  // Validate each guess contains only valid characters and has correct length
  const validChars = /^[0-9+\-×÷]*$/;
  for (let i = 0; i < gameState.guesses.length; i++) {
    const guess = gameState.guesses[i];
    if (typeof guess !== 'string') {
      console.warn(`Invalid game state: guess ${i} is not a string`);
      return false;
    }
    if (guess.length !== 5) {
      console.warn(`Invalid game state: guess ${i} length is ${guess.length}, should be 5`);
      return false;
    }
    if (!validChars.test(guess)) {
      console.warn(`Invalid game state: guess ${i} contains invalid characters: ${guess}`);
      return false;
    }
  }

  // Validate currentGuess contains only valid characters and reasonable length
  if (typeof gameState.currentGuess !== 'string') {
    console.warn('Invalid game state: currentGuess is not a string');
    return false;
  }
  if (gameState.currentGuess.length > 5) {
    console.warn(`Invalid game state: currentGuess too long: ${gameState.currentGuess.length}`);
    return false;
  }
  if (!validChars.test(gameState.currentGuess)) {
    console.warn(`Invalid game state: currentGuess contains invalid characters: ${gameState.currentGuess}`);
    return false;
  }

  // Validate tileStates values are only valid TileState enum values
  const validTileStates: TileState[] = ['correct', 'partial', 'incorrect', 'empty', 'filled'];
  for (let row = 0; row < gameState.tileStates.length; row++) {
    for (let col = 0; col < gameState.tileStates[row].length; col++) {
      const tileState = gameState.tileStates[row][col];
      if (!validTileStates.includes(tileState)) {
        console.warn(`Invalid game state: invalid tile state at [${row}][${col}]: ${tileState}`);
        return false;
      }
    }
  }

  // Validate gameWon/gameLost consistency
  if (gameState.gameWon && gameState.gameLost) {
    console.warn('Invalid game state: cannot be both won and lost');
    return false;
  }

  // If game is won, validate that there's a winning row
  if (gameState.gameWon) {
    let hasWinningRow = false;
    for (let row = 0; row < gameState.currentRow; row++) {
      const isWinningRow = gameState.tileStates[row].every(tile => tile === 'correct');
      if (isWinningRow) {
        hasWinningRow = true;
        break;
      }
    }
    if (!hasWinningRow) {
      console.warn('Invalid game state: marked as won but no winning row found');
      return false;
    }
  }

  // If game is lost, validate that all attempts were used
  if (gameState.gameLost && gameState.currentRow !== 6) {
    console.warn(`Invalid game state: marked as lost but only used ${gameState.currentRow} attempts`);
    return false;
  }

  return true;
}

/**
 * Check if a saved state belongs to the current puzzle (prevent day-old data)
 */
export function isCurrentPuzzle(puzzleNumber: number): boolean {
  const currentPuzzleNumber = getCurrentPuzzleNumber();
  const isValid = puzzleNumber === currentPuzzleNumber;

  if (!isValid) {
    console.warn(`Puzzle number mismatch: saved=${puzzleNumber}, current=${currentPuzzleNumber}`);
  }

  return isValid;
}

/**
 * Sanitize loaded game state to prevent manipulation
 * Returns a clean GameState or null if data is invalid
 */
export function sanitizeGameState(rawState: any, puzzleNumber: number): GameState | null {
  // First check if it's for the current puzzle
  if (!isCurrentPuzzle(puzzleNumber)) {
    return null;
  }

  // Validate the structure
  if (!isValidGameState(rawState)) {
    return null;
  }

  // Create a clean copy with only valid GameState properties
  const sanitizedState: GameState = {
    currentGuess: String(rawState.currentGuess).slice(0, 5), // Ensure max 5 chars
    guesses: rawState.guesses.slice(0, 6).map((guess: any) => String(guess).slice(0, 5)), // Max 6 guesses, 5 chars each
    currentRow: Math.max(0, Math.min(6, Number(rawState.currentRow))), // Clamp to 0-6
    gameWon: Boolean(rawState.gameWon),
    gameLost: Boolean(rawState.gameLost),
    tileStates: rawState.tileStates.slice(0, 6).map((row: any[]) =>
      row.slice(0, 5).map((tile: any) => {
        // Ensure only valid tile states
        const validStates: TileState[] = ['correct', 'partial', 'incorrect', 'empty', 'filled'];
        return validStates.includes(tile) ? tile : 'empty';
      })
    )
  };

  // Final validation of sanitized state
  if (!isValidGameState(sanitizedState)) {
    console.error('Failed to sanitize game state');
    return null;
  }

  return sanitizedState;
}
