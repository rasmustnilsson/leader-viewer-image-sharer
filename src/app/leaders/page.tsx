'use client';

import { useRouter } from 'next/navigation';

export default function LeadersPage() {
  const router = useRouter();

  const handleCreateSession = () => {
    const newSessionId = crypto.randomUUID();
    router.push(`/leaders/${newSessionId}`);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-white/10 backdrop-blur-sm rounded-lg m-16 p-6">
      <div className="text-center">
        <p className="text-gray-300">Create a new session or join an existing one</p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleCreateSession}
          className="w-full p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
        >
          Create New Session
        </button>
      </div>
    </div>
  );
}
