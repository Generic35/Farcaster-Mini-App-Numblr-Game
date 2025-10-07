'use client';

import { GameState, Difficulty } from '@/lib/game-logic';

interface ResultScreenProps {
  gameState: GameState;
  puzzleNumber: number;
  targetNumber: number;
  solution: string;
  difficulty: Difficulty;
  nextDifficulty: Difficulty;
  onShare: () => void;
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

  // Difficulty colors (same as mathler.tsx)
  const difficultyColors: Record<Difficulty, string> = {
    easy: 'text-green-600',
    medium: 'text-yellow-600',
    hard: 'text-red-600',
  };

  return (
    <div
      className="text-center space-y-6 mb-6"
      data-testid="result-screen"
    >
      {/* Result Header */}
      <div className="space-y-2">
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

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Share Button - Primary Action */}
        <button
          onClick={onShare}
          className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md text-lg"
          data-testid="share-result-button"
        >
          📱 Share Result
        </button>

        {/* Next Puzzle Button - Secondary Action */}
        <button
          onClick={onNextPuzzle}
          className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 active:scale-95 transition-all shadow-md"
          data-testid="next-puzzle-button"
        >
          🎲 Next Puzzle
        </button>
      </div>

      {/* Game Stats */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Game Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Puzzle</p>
            <p className="font-semibold text-foreground">#{puzzleNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-semibold text-foreground">{targetNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Attempts</p>
            <p className="font-semibold text-foreground">{attempts}/6</p>
          </div>
          <div>
            <p className="text-muted-foreground">Result</p>
            <p
              className={`font-semibold ${
                isWin ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isWin ? 'Won' : 'Lost'}
            </p>
          </div>
        </div>
      </div>

      {/* 🧪 TEMPORARY DEBUG INFO - Remove before production */}
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">
          🧪 DEBUG INFO (temporary)
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-gray-500 text-xs">Current</p>
            <p className={`font-semibold ${difficultyColors[difficulty]}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">Next</p>
            <p className={`font-semibold ${difficultyColors[nextDifficulty]}`}>
              {nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
