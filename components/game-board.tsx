import { TileState } from '@/lib/game-logic';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  currentRow: number;
  tileStates: TileState[][];
}

interface TileProps {
  character: string;
  state: TileState;
}

function Tile({ character, state }: TileProps) {
  const getTileClasses = () => {
    const baseClasses = "w-12 h-12 border-2 rounded flex items-center justify-center text-xl font-bold";
    
    switch (state) {
      case 'correct':
        return `${baseClasses} tile-correct`;
      case 'partial':
        return `${baseClasses} tile-partial`;
      case 'incorrect':
        return `${baseClasses} tile-incorrect`;
      case 'filled':
        return `${baseClasses} tile-filled`;
      default:
        return `${baseClasses} border-border bg-card`;
    }
  };

  return (
    <div className={getTileClasses()} data-testid={`tile-${character || 'empty'}`}>
      {character}
    </div>
  );
}

export function GameBoard({ guesses, currentGuess, currentRow, tileStates }: GameBoardProps) {
  const renderRow = (rowIndex: number) => {
    let rowContent = '';
    let rowStates: TileState[] = Array(5).fill('empty');

    if (rowIndex < guesses.length) {
      // Completed guess row
      rowContent = guesses[rowIndex];
      rowStates = tileStates[rowIndex];
    } else if (rowIndex === currentRow && currentGuess.length > 0) {
      // Current input row
      rowContent = currentGuess;
      rowStates = Array(5).fill('empty').map((_, i) => 
        i < currentGuess.length ? 'filled' : 'empty'
      );
    }

    // Pad content to 5 characters
    const paddedContent = rowContent.padEnd(5, ' ');

    return (
      <div key={rowIndex} className="grid grid-cols-5 gap-2" data-testid={`row-${rowIndex}`}>
        {Array.from({ length: 5 }).map((_, colIndex) => (
          <Tile
            key={colIndex}
            character={paddedContent[colIndex].trim()}
            state={rowStates[colIndex]}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mb-8">
      <div className="grid grid-rows-6 gap-2 mb-6" data-testid="game-board">
        {Array.from({ length: 6 }).map((_, rowIndex) => renderRow(rowIndex))}
      </div>
    </div>
  );
}
