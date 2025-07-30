'use client';

import { useWebSocket } from '../../providers/websocket-provider';

export default function ViewersSessionPage() {
  const { message, images } = useWebSocket();

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg text-white text-xl">
          {message}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <img
                src={image.blob}
                alt="Shared content"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              {image.duration && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {image.duration}s
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
