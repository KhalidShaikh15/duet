'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface InboxProps {
  currentUser: string;
  onSelectUser: (username: string) => void;
  onLogout: () => void;
  selectedUser: string | null;
}

export default function Inbox({ currentUser, onSelectUser, onLogout, selectedUser }: InboxProps) {
  const [users, setUsers] = useState<User[]>([]);
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user1');


  useEffect(() => {
    const q = query(
        collection(db, 'users'), 
        orderBy('isOnline', 'desc'),
        orderBy('username', 'asc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userList: User[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().username !== currentUser) {
          userList.push(doc.data() as User);
        }
      });
      setUsers(userList);
    }, (error) => {
        console.error("Error fetching users:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <aside className="flex w-full max-w-xs flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10">
                <AvatarImage src={`https://picsum.photos/seed/${currentUser}/200/200`} alt="My Avatar" />
                <AvatarFallback>{currentUser.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-xl font-semibold truncate">{currentUser}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold tracking-tight">Users</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
            {users.length === 0 && (
                <p className="p-2 text-sm text-muted-foreground">No other users available.</p>
            )}
            {users.map((user) => (
                <button
                key={user.username}
                onClick={() => onSelectUser(user.username)}
                className={cn(
                    'flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedUser === user.username ? 'bg-accent text-accent-foreground font-semibold' : ''
                )}
                >
                <div className="relative">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/${user.username}/200/200`} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {user.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                </div>
                <span className="truncate">{user.username}</span>
                </button>
            ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
