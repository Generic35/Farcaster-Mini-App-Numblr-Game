'use client';
import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameBoard } from '@/components/game-board';
import { Keypad } from '@/components/keypad';
import { useToast } from '@/hooks/use-toast';
import {
  GameState,
  PUZZLES,
  createInitialGameState,
  addCharacterToGuess,
  removeCharacterFromGuess,
  canSubmitGuess,
  getTileStates,
  checkWin,
  isValidCharacter,
  setCurrentPuzzle,
} from '@/lib/game-logic';

export default function Numbler() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [currentPuzzle, setCurrentPuzzleState] = useState(PUZZLES[0]);
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState()
  );
  const { toast } = useToast();

  const handleNextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length;
    setPuzzleIndex(nextIndex);
    setCurrentPuzzle(nextIndex);
    setCurrentPuzzleState(PUZZLES[nextIndex]);
    setGameState(createInitialGameState());
    toast({
      title: 'New Puzzle!',
      description: `Puzzle ${nextIndex + 1} of ${PUZZLES.length}`,
      duration: 2000,
    });
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

          toast({
            title: '🎉 Congratulations!',
            description: 'You solved it!',
            duration: 5000,
          });
        }, 500);
      } else if (isLoss) {
        setTimeout(() => {
          toast({
            title: 'Game Over!',
            description: `The answer was: ${currentPuzzle.solution}`,
            variant: 'destructive',
            duration: Infinity,
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

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-lg"
      data-testid="numbler-game"
    >
      {/* Game Header */}
      <header
        className="text-center mb-6"
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

      {/* Game Board */}
      <GameBoard
        guesses={gameState.guesses}
        currentGuess={gameState.currentGuess}
        currentRow={gameState.currentRow}
        tileStates={gameState.tileStates}
      />

      {/* On-Screen Keypad */}
      <Keypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
      />

      {/* Game Instructions */}
      <div
        className="text-center"
        data-testid="game-instructions"
      >
        <div className="text-sm text-muted-foreground mb-3">
          <p>Enter a math equation that equals {currentPuzzle.target}</p>
          <p>Use numbers (0-9) and operators (+, -, ×, ÷)</p>
        </div>

        {/* Color Legend */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
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
      </div>

      {/* Next Puzzle Button - TEMPORARY */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleNextPuzzle}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 active:scale-95 transition-all shadow-md"
        >
          Next Puzzle ({puzzleIndex + 1}/{PUZZLES.length})
        </button>
      </div>
    </div>
  );
}
