'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export default function ChatInput() {
  const [text, setText] = useState('');
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '' || !user) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text,
        senderId: user.uid,
        senderEmail: user.email,
        timestamp: serverTimestamp(),
      });
      setText('');
    } catch (error) {
      console.error('Error sending message: ', error);
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
        <Send className="h-5 w-5" />
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  );
}
