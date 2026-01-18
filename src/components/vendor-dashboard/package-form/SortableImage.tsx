import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';

interface SortableImageProps {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
}

export function SortableImage({ id, url, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square rounded-lg overflow-hidden ${
        isDragging ? 'z-50 shadow-2xl ring-2 ring-primary scale-105' : ''
      }`}
    >
      <img
        src={url}
        alt={`Package image ${index + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Drag handle overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center"
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg p-2">
          <GripVertical className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Cover badge */}
      {index === 0 && (
        <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md font-medium shadow-lg">
          Cover Photo
        </span>
      )}

      {/* Position indicator */}
      <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center font-medium">
        {index + 1}
      </span>
    </div>
  );
}
