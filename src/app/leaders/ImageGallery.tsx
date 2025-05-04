'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { useWebSocket } from '../providers/websocket-provider';
import { Button } from '@/app/components/ui/button';
import { SortableImage } from './SortableImage';

export function ImageGallery() {
  const { images, reorderImage, removeImage, setDuration } = useWebSocket();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((image) => image.id === active.id);
      const newIndex = images.findIndex((image) => image.id === over.id);

      reorderImage(oldIndex, newIndex);
    }
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images}>
          <div className="grid grid-cols-4 gap-4">
            {images.map(({ id, blob, duration, durationSetAt }) => (
              <SortableImage
                key={id}
                id={id}
                duration={duration}
                durationSetAt={durationSetAt}
                onDurationChange={(duration) => setDuration(id, duration)}
                onRemove={() => removeImage(id)}
                image={blob}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
