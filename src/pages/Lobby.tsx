import React, { useState } from 'react';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';

interface LobbyProps {
  onCreateRoom: (username: string) => void;
  onJoinRoom: (roomCode: string, username: string) => void;
  error?: string | null;
}

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
  error,
}) => {
  const [username, setUsername] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  React.useEffect(() => {
    const search = window.location.search;
    const code = search.replace('?', '').trim();
    if (code.length === 4) {
      setRoomCodeInput(code.toUpperCase());
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (roomCodeInput.trim().length === 4) {
      onJoinRoom(roomCodeInput.trim().toUpperCase(), username.trim());
    } else {
      onCreateRoom(username.trim());
    }
  };

  const isInviteLink = window.location.search.replace('?', '').trim().length === 4;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 w-full">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm mb-3">
          MULTIPLAYER BINGO
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto">
          Enter your name and join a match or create a new room to play in real-time.
        </p>
      </div>

      <Card className="w-full max-w-md border-slate-700/50 shadow-2xl relative overflow-hidden bg-slate-900/40 p-0">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {isInviteLink && roomCodeInput.trim().length === 4 && (
          <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-6 py-4 flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">Invite Link Detected</span>
            <span className="text-sm text-[var(--text-secondary)]">
              You've been invited to join room <span className="font-mono font-bold text-pink-400">{roomCodeInput}</span>. Enter your nickname to begin!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Input
            id="username"
            label="Username"
            placeholder="Enter your nickname..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={15}
          />

          {error && (
            <div className="p-3 text-sm text-[var(--color-danger)] bg-red-950/20 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 pt-2">
            {roomCodeInput.trim().length === 4 ? (
              <>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!username.trim()}
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-pink-500 border-none text-white hover:opacity-90"
                >
                  Join Room {roomCodeInput}
                </Button>
                
                <div className="relative flex items-center justify-center my-1">
                  <div className="w-full border-t border-[var(--border-color)]"></div>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setRoomCodeInput('');
                    // Clean URL param
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  variant="outline"
                  className="w-full text-xs py-2"
                >
                  Clear Invite & Create New Room
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!username.trim()}
                  className="w-full relative overflow-hidden group"
                >
                  Create New Room
                </Button>
                
                <div className="relative flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-color)]"></div>
                  </div>
                  <span className="relative px-3 text-sm text-[var(--text-secondary)] bg-[var(--bg-dark)] rounded-full">
                    OR
                  </span>
                </div>

                <div className="space-y-3">
                  <Input
                    id="roomCode"
                    placeholder="4-Character Room Code"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    maxLength={4}
                    className="text-center tracking-widest font-mono text-xl"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={!username.trim() || roomCodeInput.trim().length !== 4}
                    className="w-full"
                  >
                    Join Existing Room
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Lobby;
