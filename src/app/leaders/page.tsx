'use client';

import { MessageForm } from './MessageForm';
import { ImageUploader } from './ImageUploader';
import { ImageGallery } from './ImageGallery';

export default function LeadersPage() {
  return (
    <div className="w-full max-w-4xl space-y-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <MessageForm />
      <ImageUploader />
      <ImageGallery />
    </div>
  );
}
