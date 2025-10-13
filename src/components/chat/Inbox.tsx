'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, where } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';

interface InboxProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
  onLogout: () => void;
}

export default function Inbox({ currentUser, onSelectUser, selectedUser, onLogout }: InboxProps) {
  const firestore = useFirestore();
  const [users, setUsers] = useState<User[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});

  const getInitials = (name: string) => {
    if (!name) return '';
    const displayName = name.split('@')[0];
    return displayName.charAt(0).toUpperCase();
  };

  useEffect(() => {
    if (!firestore || !currentUser?.uid) return;
    
    const q = query(collection(firestore, 'users'), where('uid', '!=', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let userList: User[] = [];
      querySnapshot.forEach((doc) => {
          userList.push({ uid: doc.id, ...doc.data() } as User);
      });
      
      userList.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return (a.username || '').localeCompare(b.username || '');
      });

      setUsers(userList);
    }, (error) => {
        console.error("Error fetching users:", error);
    });

    return () => unsubscribe();
  }, [firestore, currentUser?.uid]);

  useEffect(() => {
    if (!firestore || !currentUser?.uid) return;

    const currentUserRef = doc(firestore, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(currentUserRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as User;
        setUnreadCounts(userData.unreadFrom || {});
      }
    });

    return () => unsubscribe();
  }, [firestore, currentUser?.uid]);

  return (
    <aside className="hidden h-full w-full flex-col border-r bg-background md:flex md:max-w-xs">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(currentUser.username || 'U')}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-xl font-semibold truncate">{currentUser.username}</h1>
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
                <p className="p-2 text-sm text-muted-foreground">No other users online.</p>
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
                        <AvatarFallback>{getInitials(user.username || 'U')}</AvatarFallback>
                    </Avatar>
                    {user.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                </div>
                <span className="flex-1 truncate">{user.username}</span>
                {unreadCounts[user.uid] > 0 && (
                  <Badge className="h-6 w-6 shrink-0 justify-center rounded-full p-0">
                    {unreadCounts[user.uid]}
                  </Badge>
                )}
                </button>
            ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
