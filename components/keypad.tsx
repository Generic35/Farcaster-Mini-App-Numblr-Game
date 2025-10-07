interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}

export function Keypad({ onKeyPress, onBackspace, onSubmit }: KeypadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  
  return (
    <div className="mb-6" data-testid="keypad">
      <div className="grid gap-2">
        {/* Numbers row */}
        <div className="grid grid-cols-10 gap-1 mb-2">
          {numbers.map(num => (
            <button
              key={num}
              className="h-12 bg-card border border-border hover:bg-muted text-foreground rounded font-semibold transition-colors"
              onClick={() => onKeyPress(num.toString())}
              data-testid={`key-${num}`}
            >
              {num}
            </button>
          ))}
        </div>
        
        {/* Operators and actions row */}
        <div className="grid grid-cols-6 gap-1">
          <button
            className="h-12 bg-card border border-border hover:bg-muted text-foreground rounded font-semibold transition-colors text-lg"
            onClick={() => onKeyPress('+')}
            data-testid="key-plus"
          >
            +
          </button>
          <button
            className="h-12 bg-card border border-border hover:bg-muted text-foreground rounded font-semibold transition-colors text-lg"
            onClick={() => onKeyPress('-')}
            data-testid="key-minus"
          >
            -
          </button>
          <button
            className="h-12 bg-card border border-border hover:bg-muted text-foreground rounded font-semibold transition-colors text-lg"
            onClick={() => onKeyPress('*')}
            data-testid="key-multiply"
          >
            ×
          </button>
          <button
            className="h-12 bg-card border border-border hover:bg-muted text-foreground rounded font-semibold transition-colors text-lg"
            onClick={() => onKeyPress('/')}
            data-testid="key-divide"
          >
            ÷
          </button>
          <button
            className="h-12 bg-card border border-border hover:bg-muted text-foreground rounded font-semibold transition-colors text-sm px-2"
            onClick={onBackspace}
            data-testid="key-backspace"
          >
            ⌫ DEL
          </button>
          <button
            className="h-12 bg-card border border-border hover:bg-muted text-foreground rounded font-semibold transition-colors text-sm"
            onClick={onSubmit}
            data-testid="key-enter"
          >
            ENTER
          </button>
        </div>
      </div>
    </div>
  );
}
