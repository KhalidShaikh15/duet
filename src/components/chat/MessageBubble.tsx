import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onDelete: () => void;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  onDelete,
}: MessageBubbleProps) {
  const alignment = isOwnMessage ? 'justify-end' : 'justify-start';
  const bubbleColors = isOwnMessage
    ? 'bg-primary text-primary-foreground'
    : 'bg-card text-card-foreground border';

  return (
    <div className={cn('group flex items-center gap-2', alignment)}>
       {isOwnMessage && (
         <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete message</span>
        </Button>
       )}
      <div
        className={cn(
          'max-w-xs rounded-lg px-3 py-2 shadow-sm md:max-w-md',
          bubbleColors
        )}
      >
        <p className="text-sm">{message.text}</p>
        <p className="mt-1 text-right text-xs opacity-70">
          {message.timestamp
            ? format(message.timestamp.toDate(), 'p')
            : ''}
        </p>
      </div>
    </div>
  );
}
