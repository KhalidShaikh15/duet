import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export type User = FirebaseUser;

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Timestamp;
  senderEmail: string | null;
}

export interface CallData {
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
}
