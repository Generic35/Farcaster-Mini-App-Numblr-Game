'use client';
import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameBoard } from '@/components/game-board';
import { Keypad } from '@/components/keypad';
import { ResultScreen } from '@/components/result-screen';
import { useToast } from '@/hooks/use-toast';
import { useMiniApp } from '@/contexts/miniapp-context';
import { sdk } from '@farcaster/miniapp-sdk';
import {
  GameState,
  Difficulty,
  getDailyPuzzle,
  getPuzzleForDay,
  createInitialGameState,
  addCharacterToGuess,
  removeCharacterFromGuess,
  canSubmitGuess,
  getTileStates,
  checkWin,
  isValidCharacter,
  generateShareResultData,
  getCurrentPuzzleNumber,
  generateShareUrl,
} from '@/lib/game-logic';

// 🧪 DEV: Import storage tests (remove in production)
import { testStorageUtilities, quickStorageTest } from '@/lib/test-storage';

// Rotate difficulty: Easy → Medium → Hard → Easy...
function getDifficultyForDay(dayOffset: number): Difficulty {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  return difficulties[dayOffset % 3];
}

export default function Numbler() {
  const [currentDayOffset, setCurrentDayOffset] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    getDifficultyForDay(0)
  );
  const [currentPuzzle, setCurrentPuzzle] = useState(
    getPuzzleForDay(difficulty, 0)
  );
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState()
  );
  const { toast } = useToast();
  const { isMiniAppReady, context } = useMiniApp();

  // 🧪 DEV TESTING: Force win/loss states for validation
  // Uncomment one of these lines to test the ResultScreen:
  // const [gameState, setGameState] = useState<GameState>({...createInitialGameState(), gameWon: true, currentRow: 3});
  // const [gameState, setGameState] = useState<GameState>({...createInitialGameState(), gameLost: true, currentRow: 6});

  // 💾 PERSISTENCE: Load saved game state on component mount
  useEffect(() => {
    const loadSavedGameState = async () => {
      try {
        const { loadGameState, clearOldGameStates } = await import(
          '@/lib/storage'
        );

        // Clean up old puzzle data first
        clearOldGameStates();

        const currentPuzzleNumber = getCurrentPuzzleNumber();
        const savedState = loadGameState(currentPuzzleNumber);

        if (savedState) {
          console.log(
            '💾 Loaded and validated saved game state for puzzle #' +
              currentPuzzleNumber
          );
          setGameState(savedState);
        } else {
          console.log(
            '🆕 No saved state found, starting fresh puzzle #' +
              currentPuzzleNumber
          );
        }
      } catch (error) {
        console.error('Failed to load saved game state:', error);
        // Continue with fresh state if loading fails
      }
    };

    loadSavedGameState();
  }, []);

  // 💾 PERSISTENCE: Auto-save game state whenever it changes
  useEffect(() => {
    const saveCurrentGameState = async () => {
      try {
        const { saveGameState } = await import('@/lib/storage');
        const currentPuzzleNumber = getCurrentPuzzleNumber();

        // Only save if the game has actually started (has guesses or current guess)
        if (gameState.guesses.length > 0 || gameState.currentGuess.length > 0) {
          const saved = saveGameState(currentPuzzleNumber, gameState);
          if (saved) {
            console.log('💾 Auto-saved game state');
          }
        }
      } catch (error) {
        console.error('Failed to auto-save game state:', error);
      }
    };

    saveCurrentGameState();
  }, [gameState]); // Triggers whenever gameState changes

  const handleNextPuzzle = () => {
    const nextDayOffset = currentDayOffset + 1;
    const nextDifficulty = getDifficultyForDay(nextDayOffset);
    const nextPuzzle = getPuzzleForDay(nextDifficulty, nextDayOffset);

    setCurrentDayOffset(nextDayOffset);
    setDifficulty(nextDifficulty);
    setCurrentPuzzle(nextPuzzle);
    setGameState(createInitialGameState());

    toast({
      title: `${
        nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1)
      } Puzzle`,
      description: 'New puzzle loaded!',
      duration: 2000,
    });
  };

  const handleShare = async () => {
    const resultData = generateShareResultData(
      gameState,
      getCurrentPuzzleNumber()
    );
    const shareUrl = generateShareUrl(resultData);

    // 🐛 DEBUG - Check what data is being passed
    console.log('🐛 DEBUG - Share Data:', {
      gameState,
      puzzleNumber: getCurrentPuzzleNumber(),
      resultData,
      shareUrl,
    });

    // Try native Farcaster sharing first
    if (isMiniAppReady && context) {
      try {
        // Use openUrl to open the Farcaster compose dialog
        const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
          resultData.text
        )}&embeds[]=${encodeURIComponent(shareUrl)}`;
        await sdk.actions.openUrl(composeUrl);

        toast({
          title: '🚀 Opening Farcaster composer...',
          description: 'Share your result from the compose dialog',
          duration: 3000,
        });
        return;
      } catch (error) {
        console.error('Native sharing failed:', error);
        // Fall through to clipboard fallback
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${resultData.text}\n\n${shareUrl}`);
      toast({
        title: '📱 Copied to clipboard!',
        description: 'Paste in Farcaster to share your result',
        duration: 3000,
      });
    } catch (clipboardError) {
      // Final fallback: open share URL directly
      window.open(shareUrl, '_blank');
      toast({
        title: '🔗 Share link opened',
        description: 'Share your result from the new tab',
        duration: 3000,
      });
    }
  };

  const handleKeyPress = (key: string) => {
    if (gameState.gameWon || gameState.gameLost) return;

    setGameState((prev) => ({
      ...prev,
      currentGuess: addCharacterToGuess(prev.currentGuess, key),
    }));
  };

  const handleBackspace = () => {
    if (gameState.gameWon || gameState.gameLost) return;

    setGameState((prev) => ({
      ...prev,
      currentGuess: removeCharacterFromGuess(prev.currentGuess),
    }));
  };

  const handleSubmit = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameWon || prev.gameLost) return prev;

      if (!canSubmitGuess(prev.currentGuess)) {
        toast({
          title: 'Invalid equation',
          description:
            'Please enter a valid 5-character equation that can be calculated.',
          variant: 'destructive',
          duration: 2000,
        });
        return prev;
      }

      const newTileStates = getTileStates(
        prev.currentGuess,
        currentPuzzle.solution
      );
      const isWin = checkWin(
        prev.currentGuess,
        currentPuzzle.target,
        currentPuzzle.solution
      );
      const newRow = prev.currentRow + 1;
      const isLoss = !isWin && newRow >= 6;

      // Show win/loss/try-again messages
      if (isWin) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 500);
      } else if (isLoss) {
        setTimeout(() => {
          toast({
            title: 'Game Over!',
            description: `The answer was: ${currentPuzzle.solution}`,
            variant: 'destructive',
            duration: 2000,
          });
        }, 500);
      } else {
        setTimeout(() => {
          toast({
            title: 'Not quite!',
            description: `${6 - newRow} ${
              6 - newRow === 1 ? 'try' : 'tries'
            } remaining`,
            duration: 2000,
          });
        }, 500);
      }

      return {
        ...prev,
        guesses: [...prev.guesses, prev.currentGuess],
        currentGuess: '',
        currentRow: newRow,
        gameWon: isWin,
        gameLost: isLoss,
        tileStates: prev.tileStates.map((row, index) =>
          index === prev.currentRow ? newTileStates : row
        ),
      };
    });
  }, [toast, currentPuzzle]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.gameWon || gameState.gameLost) return;

      if (isValidCharacter(event.key)) {
        handleKeyPress(event.key);
      } else if (event.key === 'Enter') {
        handleSubmit();
      } else if (event.key === 'Backspace') {
        handleBackspace();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameWon, gameState.gameLost, handleSubmit]);

  // Update the existing useEffect to also generate share URL
  useEffect(() => {
    // ✅ Validation: Test result generation when game ends
    if (gameState.gameWon || gameState.gameLost) {
      const resultData = generateShareResultData(
        gameState,
        getCurrentPuzzleNumber()
      );
      const shareUrl = generateShareUrl(resultData);

      console.log('🎲 Generated Result Data:', resultData);
      console.log('📱 Shareable Text:\n', resultData.text);
      console.log('🔗 Share URL:', shareUrl);
      console.log('🖼️ Test Frame in browser:', shareUrl);
    }
  }, [gameState.gameWon, gameState.gameLost, gameState]);

  // Get next difficulty for button label
  const nextDifficulty = getDifficultyForDay(currentDayOffset + 1);
  const difficultyColors = {
    easy: 'text-green-600',
    medium: 'text-yellow-600',
    hard: 'text-red-600',
  };

  return (
    <div
      className="container mx-auto px-4 py-4 max-w-lg min-h-screen flex flex-col"
      data-testid="numbler-game"
    >
      {/* Game Header */}
      <header
        className="text-center mb-4"
        data-testid="game-header"
      >
        <h1 className="text-3xl font-bold mb-4">Numbler</h1>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-muted-foreground mb-2">
            Find an equation that equals
          </p>
          <div
            className="text-4xl font-bold text-primary"
            data-testid="target-number"
          >
            {currentPuzzle.target}
          </div>
        </div>
      </header>

      {/* Game Area Container - Optimized for mobile viewport */}
      <div className="flex flex-col items-center space-y-2 flex-1">
        {/* Conditional: Show Result Screen or Game Board */}
        {gameState.gameWon || gameState.gameLost ? (
          <ResultScreen
            gameState={gameState}
            puzzleNumber={getCurrentPuzzleNumber()}
            targetNumber={currentPuzzle.target}
            solution={currentPuzzle.solution}
            difficulty={difficulty}
            nextDifficulty={nextDifficulty}
            onShare={handleShare}
            onNextPuzzle={handleNextPuzzle}
          />
        ) : (
          <>
            {/* Color Legend - Above game board with minimal padding */}
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mb-1">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 tile-correct rounded"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 tile-partial rounded"></div>
                <span>Wrong spot</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 tile-incorrect rounded"></div>
                <span>Not in answer</span>
              </div>
            </div>

            <GameBoard
              guesses={gameState.guesses}
              currentGuess={gameState.currentGuess}
              currentRow={gameState.currentRow}
              tileStates={gameState.tileStates}
            />

            {/* Keypad - Integrated into game area */}
            <Keypad
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>
    </div>
  );
}
