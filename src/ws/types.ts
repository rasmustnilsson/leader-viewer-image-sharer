// Client to Server messages
export type ClientToServerMessage =
  | ClientMessageSet
  | ClientImageAdd
  | ClientImageRemove
  | ClientImageReorder
  | ClientImageSetDuration;

export interface ClientMessageSet {
  type: 'clientMessageSet';
  message: string;
}

export interface ClientImageAdd {
  type: 'clientImageAdd';
  blob: string;
}

export interface ClientImageRemove {
  type: 'clientImageRemove';
  id: string;
}

export interface ClientImageReorder {
  type: 'clientImageReorder';
  fromIndex: number;
  toIndex: number;
}

export interface ClientImageSetDuration {
  type: 'clientImageSetDuration';
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
