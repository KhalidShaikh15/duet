'use client';

import { useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database not available.',
      });
      return;
    }
    if (!username.trim() || !password.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Username and password cannot be empty.',
      });
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // User not found, create a new one (sign up)
        const newUserRef = await addDoc(usersRef, {
          username,
          password, // SECURITY RISK: Storing plaintext passwords
          isOnline: true,
          lastActive: serverTimestamp(),
        });
        toast({
          title: 'Account Created',
          description: `Welcome, ${username}! Your account has been created.`,
        });
        onLogin({
          uid: newUserRef.id,
          username,
          isOnline: true,
          lastActive: new Date() as any, // Temporary client-side value
        });
      } else {
        // User found, check password (login)
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as User;

        if (userData.password === password) {
          onLogin({ uid: userDoc.id, ...userData });
        } else {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Incorrect password. Please try again.',
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Could not log in. Please try again.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-secondary">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Welcome to Duet
          </CardTitle>
          <CardDescription>
            Enter your username and password to login or sign up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
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
          <Button
            onClick={handleLogin}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login / Sign Up'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
