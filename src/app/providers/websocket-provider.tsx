'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ClientToServerMessage, ServerToClientMessage, Image } from '../api/websocket/types';

interface WebSocketContextType {
  message: string;
  images: Image[];
  sendMessage: (message: string) => void;
  sendImage: (file: File) => Promise<void>;
  removeImage: (id: string) => void;
  reorderImage: (fromIndex: number, toIndex: number) => void;
  setDuration: (id: string, duration: number | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string>('');
  const [images, setImages] = useState<Image[]>([]);
  const ws = useWebSocketConnection();

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerToClientMessage;
      if (data.type === 'serverInitialState') {
        setMessage(data.message);
        setImages(data.images);
      } else if (data.type === 'serverMessageUpdate') {
        setMessage(data.message);
      } else if (data.type === 'serverImageUpdate') {
        setImages(data.images);
      }
    };
  }, [ws]);

  const sendMessage = (newMessage: string) =>
    sendWebSocketMessage({ type: 'clientMessageSet', message: newMessage });

  const sendImage = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const imageData = `data:${file.type};base64,${base64}`;
    sendWebSocketMessage({ type: 'clientImageAdd', blob: imageData });
  };

  const removeImage = (id: string) => sendWebSocketMessage({ type: 'clientImageRemove', id });

  const reorderImage = (fromIndex: number, toIndex: number) => {
    // Optimistically update local state
    setImages((prevImages) => {
      const newImages = [...prevImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });

    // Send WebSocket message
    sendWebSocketMessage({ type: 'clientImageReorder', fromIndex, toIndex });
  };

  const setDuration = (id: string, duration: number | null) => {
    // Optimistically update local state
    setImages((prevImages) =>
      prevImages.map((img) => (img.id === id ? { ...img, duration } : img))
    );

    // Send WebSocket message
    sendWebSocketMessage({ type: 'clientImageSetDuration', id, duration });
  };

  const sendWebSocketMessage = (message: ClientToServerMessage) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(message));
  };

  return (
    <WebSocketContext.Provider
      value={{ message, images, sendMessage, sendImage, removeImage, reorderImage, setDuration }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

const useWebSocketConnection = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 20;
  const reconnectDelay = 3000; // 3 seconds

  const connectWebSocket = () => {
    const websocket = new WebSocket('ws://localhost:3001');

    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
      setReconnectAttempts(0); // Reset reconnect attempts on successful connection
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          console.log(
            `Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`
          );
          setReconnectAttempts((prev) => prev + 1);
          connectWebSocket();
        }, reconnectDelay);
      } else {
        console.log('Max reconnection attempts reached');
      }
    };

    setWs(websocket);
    return websocket;
  };

  useEffect(() => {
    const websocket = connectWebSocket();

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  return ws;
};
