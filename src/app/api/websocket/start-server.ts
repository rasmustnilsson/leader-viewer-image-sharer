import { WebSocketServer, WebSocket } from 'ws';
import {
  ClientToServerMessage,
  ServerToClientMessage,
  ServerInitialState,
  ServerMessageUpdate,
  ServerImageUpdate,
  Image,
} from './types';

// Store connected clients
const clients = new Set<WebSocket>();

// Store latest message and images
let latestMessage = '';
let images: Image[] = [];

// Map to store timeouts for images with duration
const imageTimeouts = new Map<string, NodeJS.Timeout>();

// Function to remove an image after its duration
function removeImageAfterDuration(id: string) {
  const image = images.find((img) => img.id === id);
  if (!image?.duration) return;

  const timeout = setTimeout(() => {
    handleImageRemove(id);
    imageTimeouts.delete(id);
  }, image.duration * 1000); // Convert seconds to milliseconds

  imageTimeouts.set(id, timeout);
}

// Broadcast a message to all connected clients
function broadcastMessage(message: ServerToClientMessage) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Handle message updates
function handleMessageSet(message: string) {
  latestMessage = message;
  const updateMessage: ServerMessageUpdate = {
    type: 'serverMessageUpdate',
    message: latestMessage,
  };
  broadcastMessage(updateMessage);
}

// Handle image additions
function handleImageAdd(blob: string) {
  const newImage: Image = {
    id: crypto.randomUUID(),
    blob,
    duration: null,
    durationSetAt: null,
  };
  images.push(newImage);
  const updateMessage: ServerImageUpdate = {
    type: 'serverImageUpdate',
    images: images,
  };
  broadcastMessage(updateMessage);
}

// Handle setting image duration
function handleImageSetDuration(id: string, duration: number | null) {
  const imageIndex = images.findIndex((img) => img.id === id);
  if (imageIndex === -1) return;

  // Clear any existing timeout for the image
  const existingTimeout = imageTimeouts.get(id);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
    imageTimeouts.delete(id);
  }

  // Update the image duration and timestamp
  images[imageIndex] = {
    ...images[imageIndex],
    duration: duration,
    durationSetAt: duration ? Date.now() : null,
  };

  // Schedule removal if duration is set
  if (duration !== null) {
    removeImageAfterDuration(id);
  }

  const updateMessage: ServerImageUpdate = {
    type: 'serverImageUpdate',
    images: images,
  };
  broadcastMessage(updateMessage);
}

// Handle image removals
function handleImageRemove(id: string) {
  // Clear any existing timeout for the image
  const timeout = imageTimeouts.get(id);
  if (timeout) {
    clearTimeout(timeout);
    imageTimeouts.delete(id);
  }

  images = images.filter((img) => img.id !== id);
  const updateMessage: ServerImageUpdate = {
    type: 'serverImageUpdate',
    images: images,
  };
  broadcastMessage(updateMessage);
}

// Handle image reordering
function handleImageReorder(fromIndex: number, toIndex: number) {
  if (fromIndex >= 0 && fromIndex < images.length && toIndex >= 0 && toIndex < images.length) {
    const [movedImage] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, movedImage);
    const updateMessage: ServerImageUpdate = {
      type: 'serverImageUpdate',
      images: images,
    };
    broadcastMessage(updateMessage);
  }
}

// Handle incoming messages
function handleMessage(ws: WebSocket, data: string) {
  try {
    const message: ClientToServerMessage = JSON.parse(data);
    console.log(message.type);

    switch (message.type) {
      case 'clientMessageSet':
        handleMessageSet(message.message);
        break;
      case 'clientImageAdd':
        handleImageAdd(message.blob);
        break;
      case 'clientImageRemove':
        handleImageRemove(message.id);
        break;
      case 'clientImageReorder':
        handleImageReorder(message.fromIndex, message.toIndex);
        break;
      case 'clientImageSetDuration':
        handleImageSetDuration(message.id, message.duration);
        break;
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Handle new client connections
function handleConnection(ws: WebSocket) {
  console.log('New client connected');
  clients.add(ws);

  // Send current state to new client
  const initialState: ServerInitialState = {
    type: 'serverInitialState',
    message: latestMessage,
    images: images,
  };
  ws.send(JSON.stringify(initialState));

  // Set up message handler
  ws.on('message', (data) => handleMessage(ws, data.toString()));

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
}

// Create WebSocket server
const wss = new WebSocketServer({ port: 3001 });
console.log('WebSocket server started on port 3001');

// Set up connection handler
wss.on('connection', handleConnection);
