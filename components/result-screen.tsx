'use client';

import { useState } from 'react';
import { GameState, Difficulty } from '@/lib/game-logic';
import { GameBoard } from '@/components/game-board';

interface ResultScreenProps {
  gameState: GameState;
  puzzleNumber: number;
  targetNumber: number;
  solution: string;
  difficulty: Difficulty;
  nextDifficulty: Difficulty;
  onShare: () => Promise<void>;
  onNextPuzzle: () => void;
}

export function ResultScreen({
  gameState,
  puzzleNumber,
  targetNumber,
  solution,
  difficulty,
  nextDifficulty,
  onShare,
  onNextPuzzle,
}: ResultScreenProps) {
  const isWin = gameState.gameWon;
  const attempts = gameState.currentRow;
  const [isSharing, setIsSharing] = useState(false);

  // Difficulty colors (same as mathler.tsx)
  const difficultyColors: Record<Difficulty, string> = {
    easy: 'text-green-600',
    medium: 'text-yellow-600',
    hard: 'text-red-600',
  };

  const handleShareClick = async () => {
    setIsSharing(true);
    try {
      await onShare();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className="text-center space-y-6 flex-1 flex flex-col justify-center"
      data-testid="result-screen"
    >
      {/* Prominent Share Button - Replaces game board position */}
      <div className="space-y-6">
        {/* Large Share Button - Primary Action */}
        <button
          onClick={handleShareClick}
          disabled={isSharing}
          className="w-full px-8 py-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          data-testid="share-result-button"
        >
          {isSharing ? (
            <>
              <span className="inline-block animate-spin mr-3">⏳</span>
              Sharing...
            </>
          ) : (
            <>🚀 Share Your Result</>
          )}
        </button>

        {/* Result Summary - Compact */}
        <div className="text-center space-y-2">
          {isWin ? (
            <>
              <div className="text-4xl">🎉</div>
              <h2 className="text-xl font-bold text-green-600">
                Solved in {attempts}/6!
              </h2>
            </>
          ) : (
            <>
              <div className="text-4xl">😔</div>
              <h2 className="text-xl font-bold text-red-600">Game Over</h2>
              <div className="bg-card border border-border rounded-lg p-3 mt-2">
                <p className="text-sm text-muted-foreground mb-1">
                  The correct equation was:
                </p>
                <p className="text-lg font-mono font-bold text-black dark:text-white">
                  {solution} = {targetNumber}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
