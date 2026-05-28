import { io, Socket } from 'socket.io-client';

// Use environment variable or default to localhost backend port (e.g. 3000)
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://192.168.4.5:3000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect automatically; connect as needed or in components/context
  transports: ['websocket'], // Use WebSocket transport exclusively for better performance
});

export default socket;
