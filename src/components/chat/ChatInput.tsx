'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  chatId: string;
  senderId: string;
  receiverId: string;
}

export default function ChatInput({ chatId, senderId, receiverId }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const updateUnreadCount = async () => {
    if (!firestore || !receiverId) return;
    const userRef = doc(firestore, 'users', receiverId);
    try {
      await updateDoc(userRef, {
        [`unreadFrom.${senderId}`]: increment(1),
      });
    } catch (e) {
        try {
            await updateDoc(userRef, {
                [`unreadFrom`]: {
                    [senderId]: 1
                }
            });
        } catch (error) {
            console.error("Error setting unread count", error)
        }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '' || !senderId || !firestore) return;

    setIsSending(true);
    try {
      await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
        text,
        senderId: senderId,
        timestamp: serverTimestamp(),
        read: false,
      });
      await updateUnreadCount();
      setText('');
    } catch (error) {
      console.error('Error sending message: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send message.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
          }
        }}
        rows={1}
      />
      <Button type="submit" size="icon" disabled={isSending || text.trim() === ''}>
        <Send className="h-4 w-4 md:h-5 md:w-5" />
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  );
}
