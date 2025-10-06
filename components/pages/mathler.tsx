'use client';
import { useState, useEffect } from 'react';
import { GameBoard } from '@/components/game-board';
import { Keypad } from '@/components/keypad';
import { useToast } from '@/hooks/use-toast';
import {
  GameState,
  TARGET_NUMBER,
  SOLUTION,
  createInitialGameState,
  addCharacterToGuess,
  removeCharacterFromGuess,
  canSubmitGuess,
  getTileStates,
  checkWin,
  isValidCharacter,
} from '@/lib/game-logic';
import confetti from 'canvas-confetti';

export default function Mathler() {
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState()
  );
  const { toast } = useToast();

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

  const handleSubmit = () => {
    console.log('>>> handleSubmit tapped');
    if (gameState.gameWon || gameState.gameLost) return;
    if (!canSubmitGuess(gameState.currentGuess)) {
      toast({
        title: 'Invalid equation',
        description:
          'Please enter a valid 5-character equation that can be calculated.',
        variant: 'destructive',
      });
      return;
    }

    const newTileStates = getTileStates(gameState.currentGuess, SOLUTION);
    const isWin = checkWin(gameState.currentGuess, TARGET_NUMBER, SOLUTION);
    const newRow = gameState.currentRow + 1;
    const isLoss = !isWin && newRow >= 6;

    setGameState((prev) => ({
      ...prev,
      guesses: [...prev.guesses, prev.currentGuess],
      currentGuess: '',
      currentRow: newRow,
      gameWon: isWin,
      gameLost: isLoss,
      tileStates: prev.tileStates.map((row, index) =>
        index === prev.currentRow ? newTileStates : row
      ),
    }));

    // Show win/loss messages
    if (isWin) {
      setTimeout(() => {
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Show toast
        toast({
          title: '🎉 Congratulations!',
          description: 'You solved it!',
        });
      }, 500);
    } else if (isLoss) {
      setTimeout(() => {
        toast({
          title: 'Game Over!',
          description: `The answer was: ${SOLUTION}`,
          variant: 'destructive',
        });
      }, 500);
    }
  };

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
  }, [gameState.gameWon, gameState.gameLost]);

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-lg"
      data-testid="mathler-game"
    >
      {/* Game Header */}
      <header
        className="text-center mb-8"
        data-testid="game-header"
      >
        <h1 className="text-3xl font-bold mb-4">Mathler</h1>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-muted-foreground mb-2">
            Find an equation that equals
          </p>
          <div
            className="text-4xl font-bold text-primary"
            data-testid="target-number"
          >
            {TARGET_NUMBER}
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
        <div className="text-sm text-muted-foreground mb-4">
          <p>Enter a math equation that equals {TARGET_NUMBER}</p>
          <p>Use numbers (0-9) and operators (+, -, ×, ÷)</p>
        </div>
      </div>
    </div>
  );
}
