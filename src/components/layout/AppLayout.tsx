'use client';

import { useState } from 'react';
import Inbox from '@/components/chat/Inbox';
import ChatWindow from '@/components/chat/ChatWindow';
import type { User } from '@/lib/types';


export default function AppLayout() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="flex h-screen w-full bg-secondary">
      <Inbox 
        onSelectUser={setSelectedUser} 
        selectedUser={selectedUser}
      />
      <main className="flex-1">
        {selectedUser ? (
          <ChatWindow otherUser={selectedUser} />
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