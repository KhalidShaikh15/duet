'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

interface AuthProps {
  onLoginSuccess: (username: string) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setLoading(true);
      try {
        const userRef = doc(db, 'users', username.trim());
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.password === password) {
            onLoginSuccess(username.trim());
          } else {
            toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: 'Incorrect password.',
            });
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'User does not exist.',
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        toast({
          variant: 'destructive',
          title: 'Login Error',
          description: 'An error occurred during login. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-secondary">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Welcome to Duet</CardTitle>
            <CardDescription>Please enter your credentials to log in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              autoFocus
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
