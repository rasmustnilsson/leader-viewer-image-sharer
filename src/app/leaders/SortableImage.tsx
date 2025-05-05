'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Delete } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DurationDropdown } from './DurationDropdown';

interface SortableItemProps {
  id: string;
  image: string;
  onRemove: () => void;
  duration: number | null;
  durationSetAt: number | null;
  onDurationChange: (duration: number) => void;
}

export function SortableImage({
  id,
  image,
  onRemove,
  duration,
  durationSetAt,
  onDurationChange,
}: SortableItemProps) {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    if (!duration || !durationSetAt) {
      setRemainingTime(null);
      return;
    }

    const updateRemainingTime = () => {
      const elapsedSeconds = (Date.now() - durationSetAt) / 1000;
      const remaining = Math.max(0, Math.ceil(duration - elapsedSeconds));
      setRemainingTime(remaining);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [duration, durationSetAt]);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
      <div {...listeners} className="aspect-square relative rounded-lg overflow-hidden">
        <img
          src={image}
          className="absolute inset-0 w-full h-full object-cover rounded"
          alt="Uploaded item."
        />
      </div>
      <Delete
        className="absolute top-2 right-2 h-6 w-6 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded"
        onClick={() => onRemove()}
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        {duration !== null && (
          <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">{remainingTime}s</span>
        )}
        <DurationDropdown duration={duration} onDurationChange={onDurationChange} />
      </div>
    </div>
  );
}
