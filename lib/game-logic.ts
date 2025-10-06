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

export const TARGET_NUMBER = 6;
export const SOLUTION = "1+2+3";
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
  // Check if equation evaluates to target
  const result = safeEvaluateEquation(guess);
  if (result !== target) return false;
  
  // Check if it's the exact solution or commutative equivalent
  const normalizedGuess = guess.replace(/×/g, '*').replace(/÷/g, '/');
  const normalizedSolution = solution.replace(/×/g, '*').replace(/÷/g, '/');
  
  // For this simple case, we'll consider it a win if it equals the target
  // In a more complex implementation, we might check for structural similarity
  return result === target;
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
