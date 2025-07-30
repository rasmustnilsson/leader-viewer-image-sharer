import { WebSocketServer, WebSocket } from 'ws';
import type {
  ClientToServerMessage,
  ServerToClientMessage,
  ServerInitialState,
  ServerMessageUpdate,
  ServerImageUpdate,
  Image,
  SessionId,
} from './types';
import type { IncomingMessage } from 'node:http';

interface SessionState {
  // Store connected clients
  clients: Set<WebSocket>;
  // Store latest message and images
  latestMessage: string;
  images: Image[];
  // Map to store timeouts for images with duration
  imageTimeouts: Map<string, NodeJS.Timeout>;
}

const sessions = new Map<SessionId, SessionState>();

function getOrCreateSession(sessionId: SessionId): SessionState {
  const session = sessions.get(sessionId) ?? {
    clients: new Set(),
    latestMessage: '',
    images: [],
    imageTimeouts: new Map(),
  };

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, session);
  }

  return session;
}

// Function to remove an image after its duration
function removeImageAfterDuration(sessionId: SessionId, id: string) {
  const { images, imageTimeouts } = getOrCreateSession(sessionId);
  const image = images.find((img) => img.id === id);
  if (!image?.duration) return;

  const timeout = setTimeout(() => {
    handleImageRemove(sessionId, id);
    imageTimeouts.delete(id);
  }, image.duration * 1000); // Convert seconds to milliseconds

  imageTimeouts.set(id, timeout);
}

// Broadcast a message to all connected clients in a session
function broadcastMessage(sessionId: SessionId, message: ServerToClientMessage) {
  const { clients } = getOrCreateSession(sessionId);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

// Handle message updates
function handleMessageSet(sessionId: SessionId, message: string) {
  const session = getOrCreateSession(sessionId);
  session.latestMessage = message;
  const updateMessage: ServerMessageUpdate = {
    type: 'serverMessageUpdate',
    message: session.latestMessage,
  };
  broadcastMessage(sessionId, updateMessage);
}

// Handle image additions
function handleImageAdd(sessionId: SessionId, blob: string) {
  const { images } = getOrCreateSession(sessionId);
  const newImage: Image = {
    id: crypto.randomUUID(),
    blob,
    duration: null,
    durationSetAt: null,
  };
  images.push(newImage);
  const updateMessage: ServerImageUpdate = {
    type: 'serverImageUpdate',
    images,
  };
  broadcastMessage(sessionId, updateMessage);
}

// Handle setting image duration
function handleImageSetDuration(sessionId: SessionId, id: string, duration: number | null) {
  const session = getOrCreateSession(sessionId);
  const imageIndex = session.images.findIndex((img) => img.id === id);
  if (imageIndex === -1) return;

  // Clear any existing timeout for the image
  const existingTimeout = session.imageTimeouts.get(id);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
    session.imageTimeouts.delete(id);
  }

  // Update the image duration and timestamp
  session.images[imageIndex] = {
    ...session.images[imageIndex],
    duration: duration,
    durationSetAt: duration ? Date.now() : null,
  };

  // Schedule removal if duration is set
  if (duration !== null) {
    removeImageAfterDuration(sessionId, id);
  }

  const updateMessage: ServerImageUpdate = {
    type: 'serverImageUpdate',
    images: session.images,
  };
  broadcastMessage(sessionId, updateMessage);
}

// Handle image removals
function handleImageRemove(sessionId: SessionId, id: string) {
  const session = getOrCreateSession(sessionId);

  // Clear any existing timeout for the image
  const timeout = session.imageTimeouts.get(id);
  if (timeout) {
    clearTimeout(timeout);
    session.imageTimeouts.delete(id);
  }

  session.images = session.images.filter((img) => img.id !== id);
  const updateMessage: ServerImageUpdate = {
    type: 'serverImageUpdate',
    images: session.images,
  };
  broadcastMessage(sessionId, updateMessage);
}

// Handle image reordering
function handleImageReorder(sessionId: SessionId, fromIndex: number, toIndex: number) {
  const { images } = getOrCreateSession(sessionId);
  if (fromIndex >= 0 && fromIndex < images.length && toIndex >= 0 && toIndex < images.length) {
    const [movedImage] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, movedImage);
    const updateMessage: ServerImageUpdate = {
      type: 'serverImageUpdate',
      images,
    };
    broadcastMessage(sessionId, updateMessage);
  }
}

// Handle incoming messages
function handleMessage(ws: WebSocket, sessionId: SessionId, data: string) {
  try {
    const message: ClientToServerMessage = JSON.parse(data);
    console.log(message.type, 'for session:', sessionId);

    switch (message.type) {
      case 'clientMessageSet':
        handleMessageSet(sessionId, message.message);
        break;
      case 'clientImageAdd':
        handleImageAdd(sessionId, message.blob);
        break;
      case 'clientImageRemove':
        handleImageRemove(sessionId, message.id);
        break;
      case 'clientImageReorder':
        handleImageReorder(sessionId, message.fromIndex, message.toIndex);
        break;
      case 'clientImageSetDuration':
        handleImageSetDuration(sessionId, message.id, message.duration);
        break;
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Handle new client connections
function handleConnection(ws: WebSocket, request: IncomingMessage) {
  console.log('New client connected');

  // Extract sessionId from URL query parameters
  const url = new URL(request.url ?? '', `http://${request.headers.host}`);
  const sessionId = url.searchParams.get('sessionId') as SessionId;

  if (!sessionId) {
    console.error('No sessionId provided');
    ws.close();
    return;
  }

  console.log('Client joining session:', sessionId);
  handleClientJoinSession(ws, sessionId);
}

// Handle client joining a session
function handleClientJoinSession(ws: WebSocket, sessionId: SessionId) {
  const session = getOrCreateSession(sessionId);
  session.clients.add(ws);

  // Send current state to new client
  const initialState: ServerInitialState = {
    type: 'serverInitialState',
    message: session.latestMessage,
    images: session.images,
  };
  ws.send(JSON.stringify(initialState));

  // Set up message handler
  ws.on('message', (data) => handleMessage(ws, sessionId, data.toString()));

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected from session:', sessionId);
    session.clients.delete(ws);

    // Clean up session if no clients remain
    if (session.clients.size === 0) {
      // Clear all timeouts
      for (const timeout of session.imageTimeouts.values()) {
        clearTimeout(timeout);
      }
      sessions.delete(sessionId);
      console.log('Session cleaned up:', sessionId);
    }
  });
}

// Create WebSocket server
const wss = new WebSocketServer({ port: 3001 });
console.log('WebSocket server started on port 3001');

// Set up connection handler
wss.on('connection', handleConnection);
