'use client';

import { useState } from 'react';
import { GameState, Difficulty } from '@/lib/game-logic';

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
      className="text-center flex-1 flex flex-col justify-center items-center -mt-12"
      data-testid="result-screen"
    >
      {/* Cohesive Result Block */}
      <div className="space-y-4 max-w-sm w-full">
        {/* Result Header */}
        <div className="space-y-3">
          {isWin ? (
            <>
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-green-600">
                Congratulations!
              </h2>
              <p className="text-lg text-muted-foreground">
                You solved Numbler #{puzzleNumber} in {attempts}/6 attempts!
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl">😔</div>
              <h2 className="text-2xl font-bold text-red-600">Game Over</h2>
              <p className="text-lg text-muted-foreground">
                Better luck next time!
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  The correct equation was:
                </p>
                <p className="text-xl font-mono font-bold">
                  {solution} = {targetNumber}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Share Button - Integrated with content */}
        <div className="pt-2">
          <button
            onClick={handleShareClick}
            disabled={isSharing}
            className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            data-testid="share-result-button"
          >
            {isSharing ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Sharing...
              </>
            ) : (
              <>🚀 Share to Farcaster</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
