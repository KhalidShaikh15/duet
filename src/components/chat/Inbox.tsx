'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore } from '@/firebase';

interface InboxProps {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
}

export default function Inbox({ onSelectUser, selectedUser }: InboxProps) {
  const { user: currentUser } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [users, setUsers] = useState<User[]>([]);

  const handleLogout = () => {
    if(auth) {
      auth.signOut();
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const getDisplayName = (user: User | null) => {
    if (!user) return '';
    return user.email?.split('@')[0] || 'User';
  }

  useEffect(() => {
    if (!firestore) return;
    const q = query(
        collection(firestore, 'users'), 
        orderBy('isOnline', 'desc'),
        orderBy('email', 'asc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userList: User[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().uid !== currentUser?.uid) {
          userList.push(doc.data() as User);
        }
      });
      setUsers(userList);
    }, (error) => {
        console.error("Error fetching users:", error);
    });

    return () => unsubscribe();
  }, [firestore, currentUser?.uid]);

  return (
    <aside className="flex w-full max-w-xs flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(getDisplayName(currentUser as User))}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-xl font-semibold truncate">{getDisplayName(currentUser as User)}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
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
                key={user.uid}
                onClick={() => onSelectUser(user)}
                className={cn(
                    'flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedUser?.uid === user.uid ? 'bg-accent text-accent-foreground font-semibold' : ''
                )}
                >
                <div className="relative">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{getInitials(getDisplayName(user))}</AvatarFallback>
                    </Avatar>
                    {user.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                </div>
                <span className="truncate">{getDisplayName(user)}</span>
                </button>
            ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
