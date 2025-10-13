'use client';

import { useState } from 'react';
import Inbox from '@/components/chat/Inbox';
import ChatWindow from '@/components/chat/ChatWindow';
import type { User } from '@/lib/types';


interface AppLayoutProps {
    user: User;
    onLogout: () => void;
}

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="flex h-screen w-full bg-secondary">
      <Inbox 
        currentUser={user}
        onSelectUser={setSelectedUser} 
        selectedUser={selectedUser}
        onLogout={onLogout}
      />
      <main className="flex-1">
        {selectedUser ? (
          <ChatWindow currentUser={user} otherUser={selectedUser} />
        ) : (
          <div className="flex h-full items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="font-headline text-2xl text-foreground">
                Welcome, {user.username}
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
