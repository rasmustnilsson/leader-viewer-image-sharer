'use client';

import CoverImage from '../components/CoverImage';
import { useWebSocket } from '../providers/websocket-provider';

export default function ViewersPage() {
  const { message } = useWebSocket();

  return (
    <CoverImage>
      <div className="space-y-4">
        {message && (
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg text-white text-xl">
            {message}
          </div>
        )}
      </div>
    </CoverImage>
  );
}
