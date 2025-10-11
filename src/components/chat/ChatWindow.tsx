'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Message } from '@/lib/types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import AISummary from './AISummary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatWindowProps {
  onStartVideoCall: () => void;
}

export default function ChatWindow({ onStartVideoCall }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [senderId, setSenderId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('anonymous-user-id');
    if (id) {
        setSenderId(id);
    }
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const friendAvatar = PlaceHolderImages.find((img) => img.id === 'user2');

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={friendAvatar?.imageUrl} alt="Friend's Avatar" data-ai-hint={friendAvatar?.imageHint} />
            <AvatarFallback>F</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-headline text-xl font-semibold">Friend</h2>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AISummary messages={messages.slice(-10)} />
          <Button onClick={onStartVideoCall} variant="ghost" size="icon">
            <Video className="h-5 w-5" />
            <span className="sr-only">Start video call</span>
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === senderId} />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <ChatInput />
      </div>
    </div>
  );
}
