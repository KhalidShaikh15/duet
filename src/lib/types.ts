import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

export type User = {
  uid: string;
  email: string | null;
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
