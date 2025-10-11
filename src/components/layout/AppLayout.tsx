'use client';

import { useState } from 'react';
import Inbox from '@/components/chat/Inbox';
import ChatWindow from '@/components/chat/ChatWindow';

interface AppLayoutProps {
    username: string;
    onLogout: () => void;
}

export default function AppLayout({ username, onLogout }: AppLayoutProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-full bg-secondary">
      <Inbox 
        currentUser={username} 
        onSelectUser={setSelectedUser} 
        onLogout={onLogout}
        selectedUser={selectedUser}
      />
      <main className="flex-1">
        {selectedUser ? (
          <ChatWindow currentUser={username} otherUser={selectedUser} />
        ) : (
          <div className="flex h-full items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="font-headline text-2xl text-foreground">
                Welcome to Duet
              </h1>
              <p className="text-muted-foreground">
                Select a user from the inbox to start a conversation.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
