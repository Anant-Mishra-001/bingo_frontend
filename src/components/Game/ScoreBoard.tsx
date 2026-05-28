import React from 'react';
import Card from '../Common/Card';

interface Player {
  id: string;
  username: string;
  linesCompleted: number;
  isReady?: boolean;
}

interface ScoreBoardProps {
  players: Player[];
  currentPlayerId: string;
  isGameOver?: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerId,
  isGameOver = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {players.map((player) => {
        const isSelf = player.id === currentPlayerId;
        return (
          <Card
            key={player.id}
            className={`border ${
              isSelf ? 'border-indigo-500/30 bg-indigo-950/10' : 'border-slate-800 bg-slate-900/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-[var(--text-primary)]">
                  {player.username} {isSelf && <span className="text-xs text-[var(--primary)] font-normal ml-1">(You)</span>}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {player.isReady ? 'Ready' : 'Placing numbers...'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-indigo-400">
                  {isSelf || isGameOver ? player.linesCompleted : '?'}
                </span>
                <span className="text-[var(--text-secondary)] text-sm ml-1">/ 5 Lines</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ScoreBoard;
