'use client';

import { useState } from 'react';
import Inbox from '@/components/chat/Inbox';
import ChatWindow from '@/components/chat/ChatWindow';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelRightOpen, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
    user: User;
    onLogout: () => void;
}

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-secondary md:flex-row flex-col">
      <div className={cn(
        "absolute left-0 top-0 z-20 h-full w-full transform transition-transform md:relative md:w-auto md:max-w-xs md:translate-x-0",
        isInboxOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Inbox 
          currentUser={user}
          onSelectUser={(user) => {
            setSelectedUser(user);
            setIsInboxOpen(false); // Close inbox on user selection
          }} 
          selectedUser={selectedUser}
          onLogout={onLogout}
        />
      </div>
      <main className="flex-1 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-2 top-2 z-30 md:hidden"
          onClick={() => setIsInboxOpen(!isInboxOpen)}
        >
          {isInboxOpen ? <PanelLeftOpen /> : <PanelRightOpen />}
          <span className="sr-only">Toggle Inbox</span>
        </Button>
        
        {selectedUser ? (
          <ChatWindow currentUser={user} otherUser={selectedUser} />
        ) : (
          <div className="flex h-full items-center justify-center bg-background p-4">
            <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h1 className="mt-4 font-headline text-2xl text-foreground">
                Welcome, {user.username}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Select a user from the inbox to start a conversation.
              </p>
               <Button 
                  variant="outline"
                  className="mt-4 md:hidden"
                  onClick={() => setIsInboxOpen(true)}
                >
                  Open Inbox
                </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
