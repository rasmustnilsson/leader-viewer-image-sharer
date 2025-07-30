// Client to Server messages
export type ClientToServerMessage =
  | ClientMessageSet
  | ClientImageAdd
  | ClientImageRemove
  | ClientImageReorder
  | ClientImageSetDuration;

export type SessionId = string;

export interface ClientMessageSet {
  type: 'clientMessageSet';
  sessionId: SessionId;
  message: string;
}

export interface ClientImageAdd {
  type: 'clientImageAdd';
  sessionId: SessionId;
  blob: string;
}

export interface ClientImageRemove {
  type: 'clientImageRemove';
  sessionId: SessionId;
  id: string;
}

export interface ClientImageReorder {
  type: 'clientImageReorder';
  sessionId: SessionId;
  fromIndex: number;
  toIndex: number;
}

export interface ClientImageSetDuration {
  type: 'clientImageSetDuration';
  sessionId: SessionId;
  id: string;
  duration: number | null; // Duration in seconds, null means no duration
}
// Server to Client messages
export type ServerToClientMessage = ServerInitialState | ServerMessageUpdate | ServerImageUpdate;

export interface Image {
  id: string;
  blob: string;
  duration: number | null; // Duration in seconds, null means no duration
  durationSetAt: number | null; // Unix timestamp in milliseconds when duration was set, null if no duration
}

export interface ServerInitialState {
  type: 'serverInitialState';
  message: string;
  images: Image[];
}

export interface ServerMessageUpdate {
  type: 'serverMessageUpdate';
  message: string;
}

export interface ServerImageUpdate {
  type: 'serverImageUpdate';
  images: Image[];
}

// Legacy type for backward compatibility during transition
export type WebSocketMessage = ClientToServerMessage | ServerToClientMessage;
