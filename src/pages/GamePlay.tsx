import React from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Board from '../components/Game/Board';
import TurnIndicator from '../components/Game/TurnIndicator';
import ScoreBoard from '../components/Game/ScoreBoard';

interface GameState {
  roomCode: string;
  players: {
    id: string;
    username: string;
    linesCompleted: number;
    boardSubmitted: boolean;
    board?: number[][];
    disabledNumbers?: number[];
    markedNumbers?: number[];
  }[];
  markedNumbers: number[];
  activePlayerIndex: number;
  status: 'SETUP' | 'PLAYING' | 'FINISHED';
  winnerId: string | null;
  timerExpiresAt?: number;
  timerDurationRemaining?: number;
  pendingSelection?: {
    number: number;
    selectorPlayerId: string;
  };
  disconnectedUsername?: string | null;
  disconnectExpiresAt?: number | null;
  disconnectDurationRemaining?: number | null;
  playAgainRequests?: string[];
}

interface ChatMessage {
  username: string;
  message: string;
  createdAt: Date;
  isEmoji: boolean;
}

interface FloatingNotification {
  id: string;
  username: string;
  message: string;
  isEmoji: boolean;
}

interface GamePlayProps {
  gameState: GameState;
  myPlayerId: string;
  myBoard: number[][];
  onSelectNumber: (num: number) => void;
  onLeaveRoom: () => void;
  onRequestPlayAgain: () => void;
  chatLog: ChatMessage[];
  onSendChat: (message: string) => void;
}

export const GamePlay: React.FC<GamePlayProps> = ({
  gameState,
  myPlayerId,
  myBoard,
  onSelectNumber,
  onLeaveRoom,
  onRequestPlayAgain,
  chatLog,
  onSendChat,
}) => {
  const [timeLeft, setTimeLeft] = React.useState<number>(30);
  const [disconnectTimeLeft, setDisconnectTimeLeft] = React.useState<number>(30);
  const [notifications, setNotifications] = React.useState<FloatingNotification[]>([]);

  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const prevChatCountRef = React.useRef<number>(chatLog.length);

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const myPlayerState = gameState.players.find((p) => p.id === myPlayerId);

  // React.useEffect(() => {
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  //   }
  // }, [chatLog]);

  React.useEffect(() => {
    if (chatLog.length > prevChatCountRef.current) {
      const newMessages = chatLog.slice(prevChatCountRef.current);
      
      const incomingMessages = newMessages.filter(
        (msg) => msg.username !== myPlayerState?.username
      );

      if (incomingMessages.length > 0) {
        setNotifications((prev) => {
          let updated = [...prev];
          for (const msg of incomingMessages) {
            const id = `${Date.now()}-${Math.random()}`;
            updated.push({
              id,
              username: msg.username,
              message: msg.message,
              isEmoji: msg.isEmoji,
            });

            setTimeout(() => {
              setNotifications((current) => current.filter((n) => n.id !== id));
            }, 5000);
          }

          if (updated.length > 3) {
            updated = updated.slice(updated.length - 3);
          }
          return updated;
        });
      }
    }
    prevChatCountRef.current = chatLog.length;
  }, [chatLog, myPlayerState?.username]);

  React.useEffect(() => {
    if (gameState.disconnectExpiresAt === undefined || gameState.disconnectExpiresAt === null) return;

    const updateTimer = () => {
      const offset = Number(localStorage.getItem('server_clock_offset') || 0);
      const currentServerTime = Date.now() + offset;
      const remainingMs = gameState.disconnectExpiresAt! - currentServerTime;
      setDisconnectTimeLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [gameState.disconnectExpiresAt]);

  React.useEffect(() => {
    if (gameState.timerExpiresAt === undefined || gameState.timerExpiresAt === null) return;

    const updateTimer = () => {
      const offset = Number(localStorage.getItem('server_clock_offset') || 0);
      const currentServerTime = Date.now() + offset;
      const remainingMs = gameState.timerExpiresAt! - currentServerTime;
      setTimeLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [gameState.timerExpiresAt]);

  // Phase & Turn logic
  const pendingSelection = gameState.pendingSelection;
  const isPending = !!pendingSelection;
  const isMyTurnToSelect = !isPending && (activePlayer?.id === myPlayerId);
  const isMyTurnToRespond = isPending && (pendingSelection.selectorPlayerId !== myPlayerId);

  const myLinesCompleted = myPlayerState?.linesCompleted || 0;

  const myMarkedSet = new Set(myPlayerState?.markedNumbers || []);

  const currentWinner = gameState.winnerId
    ? gameState.players.find((p) => p.id === gameState.winnerId)
    : null;

  if (gameState.status === 'FINISHED') {
    const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
    const opponentPlayer = gameState.players.find((p) => p.id !== myPlayerId);

    const hasRequestedPlayAgain = gameState.playAgainRequests?.includes(myPlayerId);
    const opponentRequestedPlayAgain = opponentPlayer && gameState.playAgainRequests?.includes(opponentPlayer.id);

    return (
      <div className="flex flex-col items-center justify-center max-w-6xl mx-auto px-4 py-6 w-full gap-8">
        {/* Winner Banner */}
        <Card className="w-full border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500" />
          <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-rose-400">
            🏆 Game Over
          </h2>
          <p className="text-xl text-[var(--text-primary)] font-bold mt-4 animate-bounce">
            {currentWinner ? `${currentWinner.username} Won the Match!` : "It's a Tie!"}
          </p>
          {currentWinner && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Completed {currentWinner.linesCompleted} lines.
            </p>
          )}

          {opponentRequestedPlayAgain && (
            <div className="mt-4 text-sm font-bold text-emerald-400 animate-pulse bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 inline-block">
              🎮 {opponentPlayer?.username} wants to play again!
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button onClick={onLeaveRoom} variant="outline" className="px-6 py-2.5">
              Return to Lobby
            </Button>
            <Button
              onClick={onRequestPlayAgain}
              disabled={hasRequestedPlayAgain}
              variant={opponentRequestedPlayAgain ? "accent" : "primary"}
              className={`px-6 py-2.5 ${opponentRequestedPlayAgain && !hasRequestedPlayAgain ? 'animate-pulse' : ''}`}
            >
              {hasRequestedPlayAgain ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Waiting for Opponent...
                </span>
              ) : opponentRequestedPlayAgain ? (
                "Accept Rematch"
              ) : (
                "Play Again"
              )}
            </Button>
          </div>
        </Card>

        {/* Boards Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* My Board */}
          {myPlayer && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-lg text-indigo-400">
                  {myPlayer.username} (You)
                </h3>
                <span className="text-sm font-semibold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700/50">
                  {myPlayer.linesCompleted} Lines Completed
                </span>
              </div>
              <Board
                grid={myPlayer.board || myBoard}
                markedNumbers={new Set(myPlayer.markedNumbers || [])}
                disabledNumbers={new Set(myPlayer.disabledNumbers || [])}
                disabled={true}
                letters={['B', 'I', 'N', 'G', 'O']}
                litLettersCount={myPlayer.linesCompleted}
              />
            </div>
          )}

          {/* Opponent Board */}
          {opponentPlayer && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-lg text-pink-400">
                  {opponentPlayer.username} (Opponent)
                </h3>
                <span className="text-sm font-semibold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700/50">
                  {opponentPlayer.linesCompleted} Lines Completed
                </span>
              </div>
              <Board
                grid={opponentPlayer.board || []}
                markedNumbers={new Set(opponentPlayer.markedNumbers || [])}
                disabledNumbers={new Set(opponentPlayer.disabledNumbers || [])}
                disabled={true}
                letters={['B', 'I', 'N', 'G', 'O']}
                litLettersCount={opponentPlayer.linesCompleted}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-5xl mx-auto px-4 py-6 w-full gap-6">
      {gameState.disconnectedUsername && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <Card className="max-w-md w-full p-8 border-rose-500/20 bg-slate-900/90 text-center relative overflow-hidden shadow-2xl shadow-rose-950/50">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-rose-500 animate-pulse" />
            <div className="text-5xl mb-4 animate-pulse">⚠️</div>
            <h3 className="text-xl font-bold text-rose-400 mb-2">Player Disconnected</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              <span className="font-bold text-white">{gameState.disconnectedUsername}</span> has lost connection. Waiting for them to reconnect...
            </p>
            
            {/* Countdown timer */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="text-4xl font-extrabold font-mono text-red-500 animate-pulse bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20">
                {disconnectTimeLeft}s
              </div>
              <span className="text-xs text-slate-500 mt-2">Match will automatically forfeit on expiry.</span>
            </div>
            
            <Button onClick={onLeaveRoom} variant="outline" className="w-full">
              Leave Match
            </Button>
          </Card>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full border-b border-[var(--border-color)] pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Bingo Battle</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Room Code: <span className="font-mono font-bold text-[var(--primary)]">{gameState.roomCode}</span>
          </p>
        </div>
        
        {gameState.status === 'PLAYING' && (
          <div className="flex flex-wrap items-center gap-4">
            <TurnIndicator 
              isMyTurn={isMyTurnToSelect || isMyTurnToRespond} 
              activePlayerName={isMyTurnToSelect || isMyTurnToRespond ? 'You' : activePlayer?.username || ''} 
            />
            
            {/* 30s Circular SVG Clock Timer */}
            <div className="relative flex items-center justify-center w-12 h-12 select-none">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-slate-800 fill-transparent"
                  strokeWidth="3.5"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className={`fill-transparent transition-all duration-300 ${
                    timeLeft <= 8
                      ? 'stroke-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse'
                      : timeLeft <= 15
                      ? 'stroke-amber-500'
                      : 'stroke-indigo-500'
                  }`}
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - timeLeft / 30)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-extrabold font-mono transition-colors duration-300 ${
                  timeLeft <= 8 ? 'text-red-400 animate-pulse' : 'text-slate-200'
                }`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={onLeaveRoom}
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
          Exit Lobby
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Game board & status card */}
        <div className="lg:col-span-8 flex flex-col gap-4 w-full">
          {/* Consistent Status Card to prevent layout shifting */}
          <div className="flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800 rounded-3xl p-6 w-full text-center relative overflow-hidden shadow-xl shadow-slate-950/50 min-h-[180px] h-[180px] select-none">
            {isPending && pendingSelection ? (
              isMyTurnToRespond ? (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                  <p className="text-xs uppercase tracking-widest text-pink-400 font-bold mb-2">Opponent Selected</p>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-pink-500/30 animate-bounce">
                    {pendingSelection.number}
                  </div>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-3 font-semibold">
                    Select <span className="text-white font-extrabold">{pendingSelection.number}</span> on your board to mark it!
                  </p>
                </>
              ) : (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-700 to-slate-800" />
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">You Selected</p>
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-2xl font-extrabold">
                    {pendingSelection.number}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs md:text-sm text-[var(--text-secondary)] justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                    <span>Waiting for opponent to mark <span className="text-indigo-400 font-bold">{pendingSelection.number}</span>...</span>
                  </div>
                </>
              )
            ) : isMyTurnToSelect ? (
              <>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">Your Turn</p>
                <div className="w-16 h-16 rounded-full bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl font-extrabold animate-pulse">
                  ?
                </div>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-3 font-semibold">
                  Select any unmarked number on your board to call it!
                </p>
              </>
            ) : (
              <>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-800 to-slate-900" />
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Opponent's Turn</p>
                <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center text-slate-600 text-2xl font-extrabold">
                  ...
                </div>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-3 font-semibold">
                  Waiting for {activePlayer?.username || 'opponent'} to choose a number...
                </p>
              </>
            )}
          </div>
          
          <Board
            grid={myBoard}
            markedNumbers={myMarkedSet}
            disabledNumbers={new Set(myPlayerState?.disabledNumbers || [])}
            targetNumber={isMyTurnToRespond ? pendingSelection?.number : undefined}
            onCellClick={onSelectNumber}
            disabled={(!isMyTurnToSelect && !isMyTurnToRespond) || gameState.status !== 'PLAYING'}
            letters={['B', 'I', 'N', 'G', 'O']}
            litLettersCount={myLinesCompleted}
          />
        </div>

        {/* Info panel, scoreboard, logs */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          <ScoreBoard players={gameState.players} currentPlayerId={myPlayerId} isGameOver={false} />

          {/* Selected log */}
          <Card className="flex flex-col gap-3 bg-slate-900/40 border-slate-800">
            <h3 className="font-bold text-base text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
              Recently Called Numbers
            </h3>
            
            {gameState.markedNumbers.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">
                Waiting for the first call...
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {gameState.markedNumbers.slice().reverse().map((num, i) => (
                  <span
                    key={`${num}-${i}`}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      i === 0
                        ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300 animate-pulse'
                        : 'bg-slate-800/60 border border-slate-700/30 text-slate-300'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Chat & Emojis Panel */}
          <Card className="flex flex-col gap-3 bg-slate-900/40 border-slate-800 h-[380px]">
            <h3 className="font-bold text-base text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
              <span>Game Chat</span>
              <span className="text-xs text-slate-500 font-normal">Emojis & Taunts</span>
            </h3>

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-0"
            >
              {chatLog.length === 0 ? (
                <div className="text-xs text-slate-500 italic my-auto text-center">
                  Select an emoji or send a message to start taunting!
                </div>
              ) : (
                chatLog.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[85%] ${
                      msg.username === myPlayerState?.username ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 mb-0.5 px-1">{msg.username}</span>
                    <div
                      className={`px-3 py-1.5 rounded-2xl text-sm ${
                        msg.isEmoji
                          ? 'text-3xl bg-transparent p-0'
                          : msg.username === myPlayerState?.username
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center gap-1 border-t border-slate-800 pt-2 select-none">
              {['😊', '😂', '🏆', '🔥', '😮', '😢'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSendChat(emoji)}
                  type="button"
                  className="text-2xl hover:scale-125 hover:-translate-y-0.5 transition-all duration-200 p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('chatMessage') as HTMLInputElement;
                if (input && input.value.trim()) {
                  onSendChat(input.value.trim());
                  input.value = '';
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                name="chatMessage"
                placeholder="Send message..."
                autoComplete="off"
                className="flex-1 bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 transition-all duration-300"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl px-3 py-1.5 text-sm font-semibold transition-all duration-200"
              >
                Send
              </button>
            </form>
          </Card>
        </div>
      </div>

      {/* Floating Chat Notifications */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-1.5 items-start pointer-events-none max-w-[240px] md:max-w-sm">
        <style>{`
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-1rem);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-fade-in-left {
            animation: fadeInLeft 0.3s ease-out forwards;
          }
        `}</style>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="w-fit bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-full px-3.5 py-1.5 shadow-xl flex items-center gap-2 animate-fade-in-left pointer-events-auto transition-all duration-300 border-l-2 border-l-indigo-500 max-w-full"
          >
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider whitespace-nowrap">
              {n.username}:
            </span>
            <span className={n.isEmoji ? 'text-lg line-clamp-1' : 'text-xs text-slate-200 font-medium line-clamp-1 break-all'}>
              {n.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamePlay;
