import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Duet',
  description: 'Private chat and video calls.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
