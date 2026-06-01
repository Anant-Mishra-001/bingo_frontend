import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

export function useBingo(socket: Socket | null) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<{ username: string; message: string; createdAt: Date; isEmoji: boolean }[]>([]);

  useEffect(() => {
    if (!socket) return;

    const syncClock = () => {
      socket.emit('SYNC_CLOCK', { clientTime: Date.now() });
    };

    socket.on('connect', syncClock);
    socket.on('SYNC_CLOCK_RESPONSE', ({ clientTime, serverTime }) => {
      const rtt = Date.now() - clientTime;
      const estimatedServerTime = serverTime + rtt / 2;
      const clockOffset = estimatedServerTime - Date.now();
      localStorage.setItem('server_clock_offset', clockOffset.toString());
    });

    if (socket.connected) {
      syncClock();
    }

    // Listeners
    socket.on('ROOM_CREATED', ({ roomCode }) => {
      setRoomCode(roomCode);
      setError(null);
    });

    const mapBackendStateToFrontend = (backendState: any): any => {
      if (!backendState) return null;

      const players = (backendState.players || []).map((p: any) => {
        const board = p.board || [];
        const disabledNumbers: number[] = [];
        const markedNumbers: number[] = [];
        if (Array.isArray(board)) {
          for (const row of board) {
            if (Array.isArray(row)) {
              for (const cell of row) {
                if (cell) {
                  if (cell.disabled) {
                    disabledNumbers.push(cell.value);
                  }
                  if (cell.marked) {
                    markedNumbers.push(cell.value);
                  }
                }
              }
            }
          }
        }

        return {
          id: p.playerId || p.id,
          username: p.username,
          linesCompleted: p.completedLines ?? 0,
          boardSubmitted: p.isReady ?? p.boardSubmitted ?? false,
          isReady: p.isReady ?? p.boardSubmitted ?? false,
          disabledNumbers,
          markedNumbers,
          board: board.map((row: any) => row.map((cell: any) => typeof cell === 'object' ? cell.value : cell)) || [],
        };
      });

      // Find index of currentTurnPlayerId
      const activePlayerIndex = players.findIndex((p: any) => p.id === backendState.currentTurnPlayerId);

      return {
        roomCode: backendState.roomCode,
        players,
        markedNumbers: backendState.selectedNumbers || [],
        activePlayerIndex: activePlayerIndex >= 0 ? activePlayerIndex : 0,
        status: backendState.status === 'WAITING' ? 'SETUP' : backendState.status,
        winnerId: backendState.winnerPlayerId || null,
        timerExpiresAt: backendState.timerExpiresAt,
        timerDurationRemaining: backendState.timerDurationRemaining,
        pendingSelection: backendState.pendingSelection,
        disconnectedUsername: backendState.disconnectedUsername,
        disconnectExpiresAt: backendState.disconnectExpiresAt,
        disconnectDurationRemaining: backendState.disconnectDurationRemaining,
        playAgainRequests: backendState.playAgainRequests || [],
      };
    };

    socket.on('GAME_UPDATED', (state) => {
      const mapped = mapBackendStateToFrontend(state);
      setGameState(mapped);
      if (mapped?.roomCode && localStorage.getItem('savedUsername')) {
        setRoomCode(mapped.roomCode);
        localStorage.setItem('savedRoomCode', mapped.roomCode);
      }
      setError(null);
    });

    socket.on('ERROR', ({ message }) => {
      setError(message);
      if (message && (message.includes('not found') || message.includes('Room not found') || message.includes('Player not found'))) {
        localStorage.removeItem('savedRoomCode');
        localStorage.removeItem('savedUsername');
      }
    });

    socket.on('GAME_OVER', ({ game }) => {
      const mapped = mapBackendStateToFrontend(game);
      setGameState(mapped);
    });

    socket.on('CHAT_RECEIVED', (chatMsg) => {
      setChatLog(prev => [...prev, chatMsg]);
    });

    return () => {
      socket.off('connect', syncClock);
      socket.off('SYNC_CLOCK_RESPONSE');
      socket.off('ROOM_CREATED');
      socket.off('GAME_UPDATED');
      socket.off('ERROR');
      socket.off('GAME_OVER');
      socket.off('CHAT_RECEIVED');
    };
  }, [socket]);

  // Actions
  const createRoom = (username: string) => {
    setChatLog([]);
    localStorage.setItem('savedUsername', username);
    socket?.emit('CREATE_ROOM', { username });
  };

  const joinRoom = (roomCode: string, username: string) => {
    setChatLog([]);
    localStorage.setItem('savedUsername', username);
    socket?.emit('JOIN_ROOM', { roomCode, username });
  };

  const reconnectGame = (roomCode: string, username: string) => {
    setChatLog([]);
    socket?.emit('RECONNECT_GAME', { roomCode, username });
  };

  const sendChat = (roomCode: string, message: string) => {
    socket?.emit('SEND_CHAT', { roomCode, message });
  };

  const submitBoard = (roomCode: string, board: number[][]) => {
    socket?.emit('SUBMIT_BOARD', { roomCode, board });
  };

  const selectNumber = (roomCode: string, number: number) => {
    socket?.emit('SELECT_NUMBER', { roomCode, number });
  };

  const requestPlayAgain = (roomCode: string) => {
    socket?.emit('REQUEST_PLAY_AGAIN', { roomCode });
  };

  return {
    roomCode,
    setRoomCode,
    gameState,
    setGameState,
    error,
    setError,
    createRoom,
    joinRoom,
    reconnectGame,
    sendChat,
    submitBoard,
    selectNumber,
    requestPlayAgain,
    chatLog,
    setChatLog,
  };
}
