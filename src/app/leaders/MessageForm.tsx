'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '../providers/websocket-provider';

export function MessageForm() {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { message, sendMessage } = useWebSocket();

  const defaultedText = text ?? message ?? '';

  useEffect(() => {
    if (text === null) return;

    try {
      sendMessage(text);
      setError('');
    } catch (err) {
      setError('Failed to send message');
    }
  }, [text, sendMessage]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={defaultedText}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter message"
          className="flex-1 p-2 border rounded"
        />
      </div>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}
