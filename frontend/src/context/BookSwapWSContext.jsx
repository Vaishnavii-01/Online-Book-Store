import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const BookSwapWSContext = createContext();

export const BookSwapWSProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const ws = useRef(null);
  const messageHandlers = useRef(new Set());

  useEffect(() => {
    connect();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    console.log('🔄 Connecting to WebSocket...');

    try {
      ws.current = new WebSocket(import.meta.env.MODE === "production"
    ? "wss://online-book-store-y7o9.onrender.com/chat"
    : "ws://localhost:5000/chat");
      
      ws.current.onopen = () => {
        console.log('✅ WebSocket connected successfully!');
        setIsConnected(true);
        setConnectionStatus('connected');
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📩 Received:', message.type);

          messageHandlers.current.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              console.error('Error in message handler:', error);
            }
          });
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket connection closed');
        setIsConnected(false);
        setConnectionStatus('disconnected');

        setTimeout(() => {
          if (connectionStatus !== 'connected') {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }
        }, 5000);
      };
      
      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('💥 Failed to create WebSocket:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    }
  };

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
        console.log('📤 Sent:', message.type);
        return true;
      } catch (error) {
        console.error('❌ Error sending message:', error);
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket not connected');
      return false;
    }
  };

  const addMessageHandler = (handler) => {
    messageHandlers.current.add(handler);
    return () => messageHandlers.current.delete(handler);
  };

  return (
    <BookSwapWSContext.Provider value={{ 
      isConnected, 
      connectionStatus,
      sendMessage,
      addMessageHandler,
      connect 
    }}>
      {children}
    </BookSwapWSContext.Provider>
  );
};

export const useBookSwapWS = () => {
  const context = useContext(BookSwapWSContext);
  if (!context) {
    throw new Error('useBookSwapWS must be used within BookSwapWSProvider');
  }
  return context;
};