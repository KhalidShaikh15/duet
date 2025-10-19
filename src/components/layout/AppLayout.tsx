'use client';

import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import Inbox from '@/components/chat/Inbox';
import ChatWindow from '@/components/chat/ChatWindow';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelRightOpen, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

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
              setIsInboxOpen(false);
            }} 
            selectedUser={selectedUser}
            onLogout={handleLogout}
          />
       </div>
       
       <div className="flex flex-1 flex-col">
            {/* Mobile Header */}
            <header className="flex items-center justify-between border-b p-2 md:hidden bg-background">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsInboxOpen(!isInboxOpen)}
                        className="h-8 w-8"
                    >
                        <PanelLeftOpen className="h-5 w-5" />
                        <span className="sr-only">Toggle Inbox</span>
                    </Button>
                    <h1 className="font-headline text-xl font-semibold truncate">
                        {selectedUser ? selectedUser.username : "Duet"}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="h-8 w-8">
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </Button>
                </div>
            </header>

            {/* Mobile Inbox (Overlay) */}
            <div className={cn(
                "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden",
                isInboxOpen ? "block" : "hidden"
            )} onClick={() => setIsInboxOpen(false)} />

            <div
                className={cn(
                    "fixed left-0 top-0 z-50 h-full w-4/5 max-w-xs transform transition-transform duration-300 ease-in-out bg-background md:hidden",
                    isInboxOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <Inbox 
                    currentUser={user}
                    onSelectUser={(user) => {
                        setSelectedUser(user);
                        setIsInboxOpen(false);
                    }} 
                    selectedUser={selectedUser}
                    onLogout={handleLogout}
                />
            </div>

            <main className="flex-1 relative">
                {selectedUser ? (
                    <ChatWindow currentUser={user} otherUser={selectedUser} />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-background p-4 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <MessageSquare className="h-16 w-16 text-muted-foreground" />
                            <div className="space-y-1">
                                <h1 className="font-headline text-3xl text-foreground">
                                    Welcome, {user.username}
                                </h1>
                                <p className="text-muted-foreground">
                                    Select a user from the inbox to start chatting.
                                </p>
                            </div>
                            <Button 
                                variant="outline"
                                className="mt-4 md:hidden"
                                onClick={() => setIsInboxOpen(true)}
                            >
                                <PanelRightOpen className="mr-2 h-4 w-4"/>
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
