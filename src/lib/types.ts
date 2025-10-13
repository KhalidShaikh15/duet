import type { Timestamp } from 'firebase/firestore';

export type User = {
  username: string;
  isOnline: boolean;
  lastActive: Timestamp;
  password?: string;
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
