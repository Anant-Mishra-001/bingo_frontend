import React, { useState, useEffect } from 'react';
import { useSocket, useBingo } from './hooks';
import Lobby from './pages/Lobby';
import BoardSetup from './pages/BoardSetup';
import GamePlay from './pages/GamePlay';
import { Card, Button } from './components';

export const App: React.FC = () => {
  const socket = useSocket();
  const bingo = useBingo(socket);

  const [myBoard, setMyBoard] = useState<number[][] | null>(null);
  // Monitor connection status
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  // Determine current player state & active page
  const myPlayerId = socket?.id || '';
  const myPlayerState = bingo.gameState?.players.find(
    (p: any) => p.id === myPlayerId
  );

  // Auto-restore myBoard if it is found in the server game state after reconnecting
  useEffect(() => {
    if (myPlayerState?.board && !myBoard) {
      setMyBoard(myPlayerState.board);
    }
  }, [myPlayerState, myBoard]);

  // Reconnect automatically if room credentials exist in localStorage
  useEffect(() => {
    if (isConnected && !bingo.roomCode) {
      const savedRoom = localStorage.getItem('savedRoomCode');
      const savedUser = localStorage.getItem('savedUsername');
      if (savedRoom && savedUser) {
        bingo.reconnectGame(savedRoom, savedUser);
      }
    }
  }, [isConnected, bingo.roomCode]);

  const handleCreateRoom = (name: string) => {
    bingo.createRoom(name);
  };

  const handleJoinRoom = (code: string, name: string) => {
    bingo.joinRoom(code, name);
  };

  const handleBoardSubmit = (board: number[][]) => {
    if (!bingo.roomCode) return;
    setMyBoard(board);
    bingo.submitBoard(bingo.roomCode, board);
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('LEAVE_ROOM', { roomCode: bingo.roomCode });
    }
    localStorage.removeItem('savedRoomCode');
    localStorage.removeItem('savedUsername');
    bingo.setRoomCode(null);
    bingo.setGameState(null);
    bingo.setError(null);
    bingo.setChatLog([]);
    setMyBoard(null);
  };

  const handleSelectNumber = (num: number) => {
    if (!bingo.roomCode) return;
    bingo.selectNumber(bingo.roomCode, num);
  };

  // Render correct view based on Game Status
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <Card className="max-w-md p-8 border-indigo-500/20 bg-slate-900/40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Connecting to Server</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Establishing a secure connection to the Multiplayer Bingo matchmaker server...
            </p>
          </Card>
        </div>
      );
    }

    if (!bingo.roomCode) {
      return (
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          error={bingo.error}
        />
      );
    }

    // If game has not started, or players are still setting up
    if (bingo.gameState?.status === 'SETUP' || !myPlayerState?.boardSubmitted) {
      // Check if user already submitted the board but opponent is still setting up
      if (myPlayerState?.boardSubmitted && myBoard) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <Card className="max-w-md p-8 border-indigo-500/20 bg-slate-900/40">
              <div className="text-4xl mb-4">⌛</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                Waiting for Opponent
              </h3>
              <p className="text-xs font-mono font-bold text-indigo-400 mb-4 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60 inline-block">
                Room Code: {bingo.roomCode}
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Your board is submitted. Waiting for other players to complete their setup.
              </p>
              <Button onClick={handleLeaveRoom} variant="outline" className="w-full">
                Leave Room
              </Button>
            </Card>
          </div>
        );
      }

      return (
        <BoardSetup
          roomCode={bingo.roomCode}
          onSubmit={handleBoardSubmit}
          onLeave={handleLeaveRoom}
        />
      );
    }

    // Active gameplay or finished state
    if (bingo.gameState && myBoard) {
      return (
        <GamePlay
          gameState={bingo.gameState}
          myPlayerId={myPlayerId}
          myBoard={myBoard}
          onSelectNumber={handleSelectNumber}
          onLeaveRoom={handleLeaveRoom}
          chatLog={bingo.chatLog}
          onSendChat={(msg) => bingo.roomCode && bingo.sendChat(bingo.roomCode, msg)}
        />
      );
    }

    // Fallback if state is out of sync
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Card className="max-w-md p-8 border-red-500/20 bg-slate-900/40">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Error Loading Session</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            An unexpected error occurred while loading your game board.
          </p>
          <Button onClick={handleLeaveRoom} variant="primary" className="w-full">
            Return to Lobby
          </Button>
        </Card>
      </div>
    );
  };

  return (
    <main className="min-h-screen text-[var(--text-primary)] font-sans antialiased selection:bg-indigo-500/30 bg-transparent">
      {/* Background neon glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
