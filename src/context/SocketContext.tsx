import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.js';

interface SocketEvent {
  type: string;
  timestamp: string;
  rooms: string[];
  payload: any;
}

interface SocketContextType {
  isConnected: boolean;
  lastEvent: SocketEvent | null;
  subscribeChannels: (channels: string[]) => void;
  emitEvent: (type: string, payload: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        // Subscribe to scoped channels for current logged in user
        const initialChannels = ['hospital:org-apex-01', 'global'];
        if (user) {
          initialChannels.push(`user:${user.id}`);
          initialChannels.push(`role:${user.role}`);
        }
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: initialChannels,
          userId: user?.id,
          role: user?.role
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: SocketEvent = JSON.parse(event.data);
          setLastEvent(data);
        } catch (e) {
          console.error('Failed to parse WebSocket event:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection error (operating in HTTP fallback mode):', err);
        setIsConnected(false);
      };

      setSocket(ws);
    } catch (err) {
      console.warn('WebSocket init exception:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [user]);

  const subscribeChannels = useCallback((channels: string[]) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        channels
      }));
    }
  }, [socket]);

  const emitEvent = useCallback((type: string, payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'event',
        eventType: type,
        payload
      }));
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ isConnected, lastEvent, subscribeChannels, emitEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
};
