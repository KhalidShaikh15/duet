'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
    </ThemeProvider>
  );
}