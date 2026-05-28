import React, { useState } from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Cell from '../components/Game/Cell';

interface BoardSetupProps {
  roomCode: string;
  onSubmit: (board: number[][]) => void;
  onLeave: () => void;
}

export const BoardSetup: React.FC<BoardSetupProps> = ({
  roomCode,
  onSubmit,
  onLeave,
}) => {
  // Init flat 25 array
  const [flatBoard, setFlatBoard] = useState<(number | '')[]>(Array(25).fill(''));
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  const flatBoardRef = React.useRef(flatBoard);

  React.useEffect(() => {
    flatBoardRef.current = flatBoard;
  }, [flatBoard]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto fill rest of the board randomly and submit
          const currentPlaced = new Set(flatBoardRef.current.filter((n): n is number => typeof n === 'number'));
          const remaining = Array.from({ length: 25 }, (_, i) => i + 1).filter(n => !currentPlaced.has(n));
          const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
          
          let shuffleIdx = 0;
          const finalBoard = flatBoardRef.current.map(cell => {
            if (cell === '') {
              return shuffledRemaining[shuffleIdx++];
            }
            return cell;
          }) as number[];

          const grid: number[][] = [];
          for (let i = 0; i < 5; i++) {
            grid.push(finalBoard.slice(i * 5, (i + 1) * 5));
          }
          onSubmit(grid);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onSubmit]);

  const handleShareLink = () => {
    const inviteLink = `${window.location.origin}/?${roomCode}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Find remaining numbers that haven't been placed yet
  const placedNumbers = new Set(flatBoard.filter((n): n is number => typeof n === 'number'));
  const remainingNumbers = Array.from({ length: 25 }, (_, i) => i + 1).filter(
    (n) => !placedNumbers.has(n)
  );

  const handleCellClick = (index: number) => {
    setSelectedCellIndex(index);
  };

  const handlePlaceNumber = (num: number) => {
    let targetIndex = selectedCellIndex;
    if (targetIndex === null) {
      targetIndex = flatBoard.findIndex((val) => val === '');
    }
    if (targetIndex === -1 || targetIndex === null) return;
    const newBoard = [...flatBoard];
    newBoard[targetIndex] = num;
    setFlatBoard(newBoard);
    
    // Automatically move selection to the next empty cell
    const nextEmptyIndex = newBoard.findIndex((val, idx) => val === '' && idx > targetIndex!);
    if (nextEmptyIndex !== -1) {
      setSelectedCellIndex(nextEmptyIndex);
    } else {
      const firstEmptyIndex = newBoard.findIndex((val) => val === '');
      setSelectedCellIndex(firstEmptyIndex !== -1 ? firstEmptyIndex : null);
    }
  };

  const handleClearCell = (index: number) => {
    const newBoard = [...flatBoard];
    newBoard[index] = '';
    setFlatBoard(newBoard);
    setSelectedCellIndex(index);
  };

  const handleRandomize = () => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    setFlatBoard(numbers);
    setSelectedCellIndex(null);
  };

  const handleClearAll = () => {
    setFlatBoard(Array(25).fill(''));
    setSelectedCellIndex(0);
  };

  const handleSubmit = () => {
    // Structure into 5x5 grid
    const grid: number[][] = [];
    for (let i = 0; i < 5; i++) {
      grid.push(flatBoard.slice(i * 5, (i + 1) * 5) as number[]);
    }
    onSubmit(grid);
  };

  const isBoardComplete = flatBoard.every((val): val is number => typeof val === 'number');

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-8 w-full gap-6">
      <div className="flex justify-between items-center w-full max-w-2xl border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <span>Setup Your Board</span>
            <span className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-semibold transition-all duration-300 ${
              timeLeft <= 15
                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                : timeLeft <= 30
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}>
              Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-sm text-[var(--text-secondary)]">
              Room Code: <span className="font-mono font-bold text-[var(--primary)]">{roomCode}</span>
            </p>
            <button
              onClick={handleShareLink}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700/50 text-indigo-400 hover:text-indigo-300'
              }`}
            >
              <span>{copied ? '✓ Link Copied' : '🔗 Share Invite Link'}</span>
            </button>
          </div>
        </div>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-700 bg-slate-900/30 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300 shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Leave Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-4xl items-start">
        {/* 5x5 grid panel */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-4 bg-slate-900/60">
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {flatBoard.map((val, idx) => {
                const isSelected = selectedCellIndex === idx;
                return (
                  <div key={idx} className="relative">
                    <Cell
                      value={val}
                      onClick={() => handleCellClick(idx)}
                      className={`${
                        isSelected ? 'ring-2 ring-indigo-500 scale-105 border-indigo-400' : ''
                      }`}
                    />
                    {val !== '' && (
                      <button
                        onClick={() => handleClearCell(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-xs font-extrabold shadow-md border border-slate-900/80 transition-colors"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          
          <div className="flex gap-4">
            <Button onClick={handleRandomize} variant="outline" className="flex-1">
              Randomize Board
            </Button>
            <Button onClick={handleClearAll} variant="outline" className="flex-1">
              Clear All
            </Button>
          </div>
        </div>

        {/* Number bank panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="flex flex-col gap-4 bg-slate-900/40">
            <h3 className="font-bold text-lg text-[var(--text-primary)]">
              Remaining Numbers
            </h3>
            
            {remainingNumbers.length === 0 ? (
              <p className="text-[var(--accent)] font-medium text-sm flex items-center gap-2">
                ✓ Every cell is filled. Click submit below.
              </p>
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">
                Select an empty cell on the grid and click a number below to place it.
              </p>
            )}

            <div className="grid grid-cols-5 gap-2">
              {remainingNumbers.map((num) => (
                <button
                  key={num}
                  disabled={flatBoard.every((val) => val !== '')}
                  onClick={() => handlePlaceNumber(num)}
                  className="aspect-square rounded-xl bg-indigo-950/20 hover:bg-[var(--primary)] border border-indigo-500/20 hover:border-indigo-400 hover:text-white disabled:opacity-30 disabled:hover:bg-indigo-950/20 disabled:hover:border-indigo-500/20 text-[var(--text-primary)] disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center transition-all duration-200"
                >
                  {num}
                </button>
              ))}
            </div>
          </Card>

          <Button
            onClick={handleSubmit}
            variant="accent"
            disabled={!isBoardComplete}
            className="w-full py-4 text-lg font-bold"
          >
            Submit Board & Start
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoardSetup;
