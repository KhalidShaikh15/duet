import type { Timestamp } from 'firebase/firestore';

export type User = {
  uid: string;
  username: string;
  password?: string; // Note: Storing plaintext passwords is insecure
  isOnline: boolean;
  lastActive: Timestamp;
  unreadFrom?: { [key: string]: number };
};

export interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  timestamp: Timestamp;
  read: boolean;
}

export interface Call {
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    caller: string;
    callee?: string;
}