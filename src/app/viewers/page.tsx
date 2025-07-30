'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ViewersPage() {
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      router.push(`/viewers/${sessionId.trim()}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-white/10 backdrop-blur-sm rounded-lg m-16 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Join Viewer Session</h1>
        <p className="text-gray-300">Enter a session ID to join</p>
      </div>

      <form onSubmit={handleJoinSession} className="space-y-4">
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Enter session ID"
          className="w-full p-3 border rounded-lg bg-white/20 text-white placeholder-gray-300"
          required
        />
        <button
          type="submit"
          className="w-full p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
        >
          Join Session
        </button>
      </form>
    </div>
  );
}
