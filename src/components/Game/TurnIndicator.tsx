import React from 'react';

interface TurnIndicatorProps {
  isMyTurn: boolean;
  activePlayerName: string;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  isMyTurn,
  activePlayerName,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-slate-900/40 border border-[var(--border-color)]">
      <span
        className={`w-3.5 h-3.5 rounded-full ${
          isMyTurn
            ? 'bg-[var(--accent)] animate-pulse shadow-[0_0_12px_var(--accent)]'
            : 'bg-[var(--secondary)] animate-pulse shadow-[0_0_12px_var(--secondary)]'
        }`}
      />
      <span className="font-semibold text-lg text-[var(--text-primary)]">
        {isMyTurn ? 'Your Turn' : `Waiting for ${activePlayerName}...`}
      </span>
    </div>
  );
};

export default TurnIndicator;
