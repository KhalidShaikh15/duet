'use client';

import { useState } from 'react';
import { summarizeLastTenMessages } from '@/ai/flows/summarize-last-ten-messages';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AISummaryProps {
  messages: Message[];
}

export default function AISummary({ messages }: AISummaryProps) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (messages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Not enough messages',
        description: 'There are no messages to summarize.',
      });
      return;
    }
    setLoading(true);
    setSummary('');
    try {
      const messageTexts = messages.map((m) => m.text || (m.imageUrl ? 'Image' : '')).filter(Boolean);
      const result = await summarizeLastTenMessages({ messages: messageTexts });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error summarizing messages:', error);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: 'Could not generate a summary. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button onClick={handleSummarize} variant="ghost" size="icon" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          <span className="sr-only">Summarize Chat</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none font-headline">AI Summary</h4>
            <p className="text-sm text-muted-foreground">
              A brief summary of the last 10 messages.
            </p>
          </div>
          <div className="text-sm">
            {loading && 'Generating summary...'}
            {summary && !loading && summary}
            {!summary && !loading && 'Click the button to generate a summary.'}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}