import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageBubble({
  message,
  isOwnMessage,
}: MessageBubbleProps) {
  const alignment = isOwnMessage ? 'justify-end' : 'justify-start';
  const bubbleColors = isOwnMessage
    ? 'bg-primary text-primary-foreground'
    : 'bg-card text-card-foreground border';

  return (
    <div className={cn('flex items-end gap-2', alignment)}>
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
