import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Create socket connection
    socketRef.current = io(apiUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      setConnected(true);
      // Join the lobby to receive vet availability updates
      socket.emit('join_lobby');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
