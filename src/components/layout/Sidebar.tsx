'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Sidebar() {
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
      </div>
    </aside>
  );
}
