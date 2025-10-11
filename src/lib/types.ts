import type { Timestamp } from 'firebase/firestore';

export type User = {
  uid: string;
  email: string | null;
};

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
