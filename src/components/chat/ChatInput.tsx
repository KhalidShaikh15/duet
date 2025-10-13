'use client';

import { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { storage } from '@/firebase/storage';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  chatId: string;
  senderId: string;
  receiverId: string;
}

export default function ChatInput({ chatId, senderId, receiverId }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const updateUnreadCount = async () => {
    if (!firestore || !receiverId) return;
    const userRef = doc(firestore, 'users', receiverId);
    try {
      await updateDoc(userRef, {
        [`unreadFrom.${senderId}`]: increment(1),
      });
    } catch (e) {
        // If the field doesn't exist, set it
        await updateDoc(userRef, {
            [`unreadFrom.${senderId}`]: 1,
        });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '' || !senderId || !firestore) return;

    setIsSending(true);
    try {
      await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
        text,
        senderId: senderId,
        timestamp: serverTimestamp(),
        read: false,
      });
      await updateUnreadCount();
      setText('');
    } catch (error) {
      console.error('Error sending message: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send message.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !firestore) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `chat-images/${chatId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
        imageUrl: downloadURL,
        senderId: senderId,
        timestamp: serverTimestamp(),
        read: false,
      });
      await updateUnreadCount();

    } catch (error) {
      console.error('Error uploading image: ', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload the image. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="Attach image"
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
        <span className="sr-only">Attach an image</span>
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
          }
        }}
        rows={1}
        disabled={isUploading}
      />
      <Button type="submit" size="icon" disabled={isSending || text.trim() === '' || isUploading}>
        <Send className="h-5 w-5" />
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  );
}