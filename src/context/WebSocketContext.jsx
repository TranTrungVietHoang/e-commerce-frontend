import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const subscribersRef = useRef({});

  useEffect(() => {
    if (!isAuthenticated) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const wsBase = (import.meta.env.VITE_WS_URL || 'http://localhost:8080')
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');

    const client = new Client({
      // /ws-native: endpoint native WebSocket (không cần SockJS)
      brokerURL: `${wsBase}/ws-native`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        // Đăng ký lại các subscription khi reconnect
        Object.entries(subscribersRef.current).forEach(([topic, cbs]) => {
          if (cbs.size > 0) {
            client.subscribe(topic, (msg) => {
              const payload = JSON.parse(msg.body);
              cbs.forEach((cb) => cb(payload));
            });
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated]);

  const subscribe = (topic, callback) => {
    if (!subscribersRef.current[topic]) {
      subscribersRef.current[topic] = new Set();
    }
    subscribersRef.current[topic].add(callback);

    if (clientRef.current?.connected) {
      const sub = clientRef.current.subscribe(topic, (msg) => {
        const payload = JSON.parse(msg.body);
        callback(payload);
      });
      return () => {
        sub.unsubscribe();
        subscribersRef.current[topic]?.delete(callback);
      };
    }

    return () => {
      subscribersRef.current[topic]?.delete(callback);
    };
  };

  return (
    <WebSocketContext.Provider value={{ connected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
export default WebSocketContext;
