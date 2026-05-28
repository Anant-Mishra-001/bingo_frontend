import React from 'react';
import Cell from './Cell';

interface BoardProps {
  grid: number[][];
  markedNumbers?: Set<number>;
  disabledNumbers?: Set<number>;
  targetNumber?: number;
  onCellClick?: (value: number) => void;
  disabled?: boolean;
  letters?: string[];
  litLettersCount?: number;
}

export const Board: React.FC<BoardProps> = ({
  grid,
  markedNumbers = new Set(),
  disabledNumbers = new Set(),
  targetNumber,
  onCellClick,
  disabled = false,
  letters,
  litLettersCount = 0,
}) => {
  return (
    <div className={`grid ${letters ? 'grid-cols-[2.5rem_repeat(5,1fr)] md:grid-cols-[3.5rem_repeat(5,1fr)]' : 'grid-cols-5'} gap-2 md:gap-3 p-4 bg-slate-900/60 rounded-2xl border border-[var(--border-color)] w-full`}>
      {grid.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {letters && (
            <div className="flex items-center justify-center pr-1 md:pr-2 select-none">
              <span
                className={`text-xl md:text-2xl font-extrabold w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm aspect-square ${
                  litLettersCount > rowIndex
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500 border-pink-400 text-white scale-105 shadow-pink-500/40 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-600'
                }`}
              >
                {letters[rowIndex]}
              </span>
            </div>
          )}
          {row.map((val, colIndex) => {
            const isMarked = markedNumbers.has(val);
            const isDisabledCell = disabledNumbers.has(val);
            const isNotTarget = targetNumber !== undefined && val !== targetNumber;
            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={val}
                isMarked={isMarked}
                isDisabled={isDisabledCell}
                onClick={() => onCellClick?.(val)}
                disabled={disabled || isMarked || isDisabledCell || isNotTarget}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Board;
