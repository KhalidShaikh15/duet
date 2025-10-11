'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      toast({
        title: 'Success',
        description: "You're now logged in.",
      });
      router.push('/');
    } catch (error) {
      console.error('Anonymous login failed', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not log in. Please try again.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Button
        onClick={handleAnonymousLogin}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        <LogIn className="mr-2 h-5 w-5" />
        {loading ? 'Entering...' : 'Enter Anonymously'}
      </Button>
    </div>
  );
}
