'use client';

import { MessageForm } from '../MessageForm';
import { ImageUploader } from '../ImageUploader';
import { ImageGallery } from '../ImageGallery';
import { useParams } from 'next/navigation';

export default function LeadersSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return (
    <div className="w-full max-w-4xl space-y-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              const viewerUrl = `${window.location.origin}/viewers/${sessionId}`;
              navigator.clipboard.writeText(viewerUrl);
            }}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Copy link for followers
          </button>
        </div>
      </div>
      <MessageForm />
      <ImageUploader />
      <ImageGallery />
    </div>
  );
}
