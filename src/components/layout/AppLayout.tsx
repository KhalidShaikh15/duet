'use client';

import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import Inbox from '@/components/chat/Inbox';
import ChatWindow from '@/components/chat/ChatWindow';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelRightOpen, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
    user: User;
    onLogout: () => void;
}

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  
  const handleLogout = async () => {
    onLogout();
    await signOut(getAuth());
  }

  return (
    <div className="flex h-screen w-full bg-secondary">
       {/* Desktop Sidebar */}
       <div className="hidden md:flex md:flex-shrink-0">
          <Inbox 
            currentUser={user}
            onSelectUser={(user) => {
              setSelectedUser(user);
              setIsInboxOpen(false); // Close inbox on user selection
            }} 
            selectedUser={selectedUser}
            onLogout={handleLogout}
          />
       </div>
       
       <div className="flex flex-1 flex-col">
            {/* Mobile Header */}
            <div className="flex items-center justify-between border-b p-2 md:hidden bg-background">
                <div className="flex items-center gap-3 overflow-hidden">
                    <h1 className="font-headline text-xl font-semibold truncate">{user.username}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsInboxOpen(!isInboxOpen)}
                    >
                    {isInboxOpen ? <PanelLeftOpen /> : <PanelRightOpen />}
                    <span className="sr-only">Toggle Inbox</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                    </Button>
                </div>
            </div>

            {/* Mobile Inbox (Overlay) */}
            {isInboxOpen && (
                <div className="absolute left-0 top-0 z-20 h-full w-full bg-black/50 md:hidden" onClick={() => setIsInboxOpen(false)}>
                    <div 
                        className={cn(
                            "absolute left-0 top-0 z-30 h-full w-4/5 max-w-xs transform transition-transform duration-300 ease-in-out bg-background",
                            isInboxOpen ? 'translate-x-0' : '-translate-x-full'
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Inbox 
                            currentUser={user}
                            onSelectUser={(user) => {
                                setSelectedUser(user);
                                setIsInboxOpen(false); // Close inbox on user selection
                            }} 
                            selectedUser={selectedUser}
                            onLogout={handleLogout}
                        />
                    </div>
                </div>
            )}

            <main className="flex-1 relative">
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
    </div>
  );
}
