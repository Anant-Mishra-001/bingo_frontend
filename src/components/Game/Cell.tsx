import React from 'react';

interface CellProps {
  value: number | '';
  isMarked?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Cell: React.FC<CellProps> = ({
  value,
  isMarked = false,
  isDisabled = false,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value === ''}
      className={`aspect-square w-full rounded-xl flex items-center justify-center font-bold text-xl md:text-2xl transition-all duration-300 transform active:scale-95 ${
        isMarked
          ? 'bg-[var(--accent)] text-white shadow-lg shadow-emerald-500/30'
          : isDisabled
          ? 'bg-red-950/20 border border-red-500/20 text-red-500/60 opacity-40 line-through'
          : 'bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 text-[var(--text-primary)] hover:border-indigo-500/30'
      } disabled:cursor-not-allowed ${className}`}
    >
      {value}
    </button>
  );
};

export default Cell;
