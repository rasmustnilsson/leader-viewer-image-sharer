import { useState } from 'react';
import { useWebSocket } from '../providers/websocket-provider';

export function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { sendImage } = useWebSocket();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendImage(file);
      setSuccess(true);
      e.target.value = ''; // Reset the input
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className="inline-block cursor-pointer w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 bg-white/20 py-2 px-4 rounded-lg text-sm font-semibold text-center"
        >
          Add another image
        </label>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
