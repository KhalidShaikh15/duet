'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  doc,
} from 'firebase/firestore';
import type { Message, User } from '@/lib/types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import AISummary from './AISummary';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChatId, cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';


interface ChatWindowProps {
  otherUser: User;
}

export default function ChatWindow({ otherUser }: ChatWindowProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.uid || !otherUser?.uid || !firestore) return;

    const newChatId = getChatId(currentUser.uid, otherUser.uid);
    setChatId(newChatId);
    setMessages([]);

    const userDocRef = doc(firestore, 'users', otherUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()) {
            setChatPartner(doc.data() as User);
        } else {
            setChatPartner(null);
        }
    });

    const messagesColRef = collection(firestore, 'chats', newChatId, 'messages');
    const q = query(
      messagesColRef,
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    }, (error) => {
        console.error("Error fetching messages:", error);
    });

    return () => {
        unsubscribeUser();
        unsubscribeMessages();
    };
  }, [currentUser, otherUser, firestore]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            // A slight delay to allow images and other content to render
            setTimeout(() => {
                 viewport.scrollTop = viewport.scrollHeight;
            }, 100);
        }
    }
  }, [messages]);

  const getInitials = (name: string) => {
    if (!name) return '';
    const displayName = name.split('@')[0];
    return displayName.charAt(0).toUpperCase();
  }
  
  const getDisplayName = (user: User | null) => {
    return user?.email?.split('@')[0] || 'User';
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
        <div className={'flex h-full flex-col'}>
            {chatPartner && currentUser ? (
                <>
                <header className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(getDisplayName(chatPartner))}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-headline text-xl font-semibold">{getDisplayName(chatPartner)}</h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", chatPartner.isOnline ? 'bg-green-500' : 'bg-gray-400')} />
                            {chatPartner.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AISummary messages={messages.slice(-10)} />
                    </div>
                </header>
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === currentUser.uid} />
                    ))}
                    </div>
                </ScrollArea>
                <div className="border-t p-4">
                    {chatId && <ChatInput chatId={chatId} senderId={currentUser.uid} />}
                </div>
                </>
            ) : (
                 <div className="flex h-full items-center justify-center bg-background">
                    <div className="text-center">
                    <h1 className="font-headline text-2xl text-foreground">
                        Select a user
                    </h1>
                    <p className="text-muted-foreground">
                        Choose someone from the list to start a conversation.
                    </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
