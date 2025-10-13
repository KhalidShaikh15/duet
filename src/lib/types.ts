import type { Timestamp } from 'firebase/firestore';

export type User = {
  uid: string;
  username: string;
  password?: string; // Note: Storing plaintext passwords is insecure
  isOnline: boolean;
  lastActive: Timestamp;
};

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Timestamp;
}

export interface Call {
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    caller: string;
    callee?: string;
}
