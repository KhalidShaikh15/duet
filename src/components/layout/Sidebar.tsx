'use client';

import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase/config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Sidebar() {
  const { user } = useAuth();

  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user1');

  return (
    <aside className="flex w-20 flex-col items-center space-y-4 border-r border-border bg-background p-4">
      <h1 className="font-headline text-2xl font-bold text-primary">D</h1>
      <div className="flex-1">
        <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary">
          <AvatarImage src={userAvatar?.imageUrl} alt="My Avatar" data-ai-hint={userAvatar?.imageHint} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => auth.signOut()}
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </aside>
  );
}
