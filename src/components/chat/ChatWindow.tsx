'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Message, User } from '@/lib/types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import AISummary from './AISummary';
import VideoCall from '../video/VideoCall';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChatId, cn } from '@/lib/utils';


interface ChatWindowProps {
  currentUser: string;
  otherUser: string;
}

export default function ChatWindow({ currentUser, otherUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    const newChatId = getChatId(currentUser, otherUser);
    setChatId(newChatId);
    setMessages([]);
    setIsVideoCallActive(false);

    const userDocRef = doc(db, 'users', otherUser);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()) {
            setChatPartner(doc.data() as User);
        } else {
            setChatPartner(null);
        }
    });

    const messagesColRef = collection(db, 'chats', newChatId, 'messages');
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
  }, [currentUser, otherUser]);

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

  const friendAvatar = PlaceHolderImages.find((img) => img.id === 'user2');

  const handleStartCall = () => {
    if (chatId) {
        setIsVideoCallActive(true);
    }
  }

  const handleHangUp = useCallback(() => {
    setIsVideoCallActive(false);
  }, []);

  return (
    <div className="relative flex h-full flex-col bg-background">
        {isVideoCallActive && chatId && (
            <VideoCall 
                callId={chatId} 
                onHangUp={handleHangUp} 
                currentUser={currentUser}
            />
        )}
        <div className={cn('flex h-full flex-col', isVideoCallActive ? 'hidden' : 'flex')}>
            {chatPartner ? (
                <>
                <header className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://picsum.photos/seed/${otherUser}/200/200`} alt={`${otherUser}'s Avatar`} />
                        <AvatarFallback>{otherUser.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-headline text-xl font-semibold">{otherUser}</h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", chatPartner.isOnline ? 'bg-green-500' : 'bg-gray-400')} />
                            {chatPartner.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                    <AISummary messages={messages.slice(-10)} />
                    <Button onClick={handleStartCall} variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                        <span className="sr-only">Start video call</span>
                    </Button>
                    </div>
                </header>
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === currentUser} />
                    ))}
                    </div>
                </ScrollArea>
                <div className="border-t p-4">
                    {chatId && <ChatInput chatId={chatId} senderId={currentUser} />}
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
