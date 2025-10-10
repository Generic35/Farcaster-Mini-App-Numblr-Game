import { GameState, getCurrentPuzzleNumber, isValidGameState, sanitizeGameState } from './game-logic';

// Storage key prefix to avoid conflicts with other apps
const STORAGE_PREFIX = 'numbler_';
const GAME_STATE_KEY = `${STORAGE_PREFIX}game_state_`;
const METADATA_KEY = `${STORAGE_PREFIX}metadata`;

// Metadata to track saved puzzles for cleanup
interface StorageMetadata {
  savedPuzzles: number[];
  lastCleanup: number;
}

// Saved game state with puzzle validation
interface SavedGameState extends GameState {
  puzzleNumber: number;
  savedAt: number; // timestamp
  version: string; // for future compatibility
}

/**
 * Check if localStorage is available and functional
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    // Test localStorage functionality
    const testKey = `${STORAGE_PREFIX}test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage not available:', error);
    return false;
  }
}

/**
 * Validate puzzle number is a positive integer
 */
function validatePuzzleNumber(puzzleNumber: number): boolean {
  return Number.isInteger(puzzleNumber) && puzzleNumber > 0;
}

/**
 * Validate game state structure matches GameState interface
 */
function validateGameStateStructure(gameState: any): gameState is GameState {
  if (!gameState || typeof gameState !== 'object') {
    return false;
  }

  // Check required properties exist and have correct types
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

  return true;
}

/**
 * Get storage metadata for cleanup tracking
 */
function getStorageMetadata(): StorageMetadata {
  if (!isLocalStorageAvailable()) {
    return { savedPuzzles: [], lastCleanup: 0 };
  }

  try {
    const metadata = localStorage.getItem(METADATA_KEY);
    if (metadata) {
      const parsed = JSON.parse(metadata);
      return {
        savedPuzzles: Array.isArray(parsed.savedPuzzles) ? parsed.savedPuzzles : [],
        lastCleanup: typeof parsed.lastCleanup === 'number' ? parsed.lastCleanup : 0
      };
    }
  } catch (error) {
    console.warn('Failed to parse storage metadata:', error);
  }

  return { savedPuzzles: [], lastCleanup: 0 };
}

/**
 * Update storage metadata
 */
function updateStorageMetadata(metadata: StorageMetadata): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.warn('Failed to update storage metadata:', error);
  }
}

/**
 * Save game state to localStorage with validation
 */
export function saveGameState(puzzleNumber: number, gameState: GameState): boolean {
  // Validation Step 1: Check localStorage availability
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot save game state: localStorage not available');
    return false;
  }

  // Validation Step 2: Validate puzzle number
  if (!validatePuzzleNumber(puzzleNumber)) {
    console.error('Cannot save game state: invalid puzzle number', puzzleNumber);
    return false;
  }

  // Validation Step 3: Validate game state structure using comprehensive validation
  if (!isValidGameState(gameState)) {
    console.error('Cannot save game state: invalid game state structure');
    return false;
  }

  try {
    // Create saved state with metadata
    const savedState: SavedGameState = {
      ...gameState,
      puzzleNumber,
      savedAt: Date.now(),
      version: '1.0'
    };

    // Validation Step 4: Test JSON serialization
    const serialized = JSON.stringify(savedState);

    // Validation Step 5: Handle localStorage quota
    const key = `${GAME_STATE_KEY}${puzzleNumber}`;
    localStorage.setItem(key, serialized);

    // Update metadata to track this puzzle
    const metadata = getStorageMetadata();
    if (!metadata.savedPuzzles.includes(puzzleNumber)) {
      metadata.savedPuzzles.push(puzzleNumber);
      updateStorageMetadata(metadata);
    }

    console.log(`Game state saved for puzzle #${puzzleNumber}`);
    return true;

  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('Cannot save game state: localStorage quota exceeded');
      // Attempt cleanup and retry once
      clearOldGameStates();
      try {
        const key = `${GAME_STATE_KEY}${puzzleNumber}`;
        localStorage.setItem(key, JSON.stringify({
          ...gameState,
          puzzleNumber,
          savedAt: Date.now(),
          version: '1.0'
        }));
        return true;
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
      }
    } else {
      console.error('Failed to save game state:', error);
    }
    return false;
  }
}

/**
 * Load game state from localStorage with validation
 */
export function loadGameState(puzzleNumber: number): GameState | null {
  // Validation Step 1: Check localStorage availability
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot load game state: localStorage not available');
    return null;
  }

  // Validation Step 2: Validate puzzle number
  if (!validatePuzzleNumber(puzzleNumber)) {
    console.error('Cannot load game state: invalid puzzle number', puzzleNumber);
    return null;
  }

  try {
    const key = `${GAME_STATE_KEY}${puzzleNumber}`;
    const saved = localStorage.getItem(key);

    if (!saved) {
      console.log(`No saved state found for puzzle #${puzzleNumber}`);
      return null;
    }

    // Validation Step 3: Test JSON deserialization
    const parsedState: SavedGameState = JSON.parse(saved);

    // Validation Step 4: Verify puzzle number matches first
    if (parsedState.puzzleNumber !== puzzleNumber) {
      console.error('Saved state puzzle number mismatch, removing');
      localStorage.removeItem(key);
      return null;
    }

    // Validation Step 5: Use comprehensive sanitization and validation
    const sanitizedState = sanitizeGameState(parsedState, puzzleNumber);
    if (!sanitizedState) {
      console.error('Failed to sanitize saved game state, removing');
      localStorage.removeItem(key);
      return null;
    }

    console.log(`Game state loaded and validated for puzzle #${puzzleNumber}`);
    return sanitizedState;

  } catch (error) {
    console.error('Failed to load game state:', error);
    // Remove corrupted data
    const key = `${GAME_STATE_KEY}${puzzleNumber}`;
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Clear old game states to prevent storage bloat
 * Keeps only current puzzle and removes puzzles older than 7 days
 */
export function clearOldGameStates(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const currentPuzzle = getCurrentPuzzleNumber();
    const metadata = getStorageMetadata();
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Only run cleanup once per day to avoid performance impact
    if (metadata.lastCleanup > now - (24 * 60 * 60 * 1000)) {
      return;
    }

    let removedCount = 0;
    const remainingPuzzles: number[] = [];

    for (const puzzleNumber of metadata.savedPuzzles) {
      const key = `${GAME_STATE_KEY}${puzzleNumber}`;

      // Keep current puzzle
      if (puzzleNumber === currentPuzzle) {
        remainingPuzzles.push(puzzleNumber);
        continue;
      }

      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsedState: SavedGameState = JSON.parse(saved);

          // Remove if older than 7 days
          if (parsedState.savedAt < sevenDaysAgo) {
            localStorage.removeItem(key);
            removedCount++;
          } else {
            remainingPuzzles.push(puzzleNumber);
          }
        } else {
          // Key doesn't exist, remove from metadata
          removedCount++;
        }
      } catch (error) {
        // Corrupted data, remove it
        localStorage.removeItem(key);
        removedCount++;
      }
    }

    // Update metadata
    updateStorageMetadata({
      savedPuzzles: remainingPuzzles,
      lastCleanup: now
    });

    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old game states`);
    }

  } catch (error) {
    console.error('Failed to clean up old game states:', error);
  }
}

/**
 * Check if there's a saved state for the current puzzle
 */
export function hasSavedState(puzzleNumber: number): boolean {
  if (!isLocalStorageAvailable() || !validatePuzzleNumber(puzzleNumber)) {
    return false;
  }

  const key = `${GAME_STATE_KEY}${puzzleNumber}`;
  return localStorage.getItem(key) !== null;
}

/**
 * Clear saved state for a specific puzzle (for testing/debugging)
 */
export function clearGameState(puzzleNumber: number): boolean {
  if (!isLocalStorageAvailable() || !validatePuzzleNumber(puzzleNumber)) {
    return false;
  }

  try {
    const key = `${GAME_STATE_KEY}${puzzleNumber}`;
    localStorage.removeItem(key);

    // Update metadata
    const metadata = getStorageMetadata();
    metadata.savedPuzzles = metadata.savedPuzzles.filter(p => p !== puzzleNumber);
    updateStorageMetadata(metadata);

    console.log(`Cleared saved state for puzzle #${puzzleNumber}`);
    return true;
  } catch (error) {
    console.error('Failed to clear game state:', error);
    return false;
  }
}
