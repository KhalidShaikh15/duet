'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export default function ChatInput() {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [senderId, setSenderId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('anonymous-user-id');
    if (!id) {
        id = `anon-${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem('anonymous-user-id', id);
    }
    setSenderId(id);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '' || !senderId) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text,
        senderId: senderId,
        senderEmail: 'anonymous',
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
