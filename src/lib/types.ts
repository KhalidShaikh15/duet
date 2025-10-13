import type { Timestamp } from 'firebase/firestore';

export type User = {
  uid: string;
  username: string; // This will now store the user's email
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

export interface CallData {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  callerId: string;
  calleeId: string;
  status: 'pending' | 'active' | 'ended';
}

export interface IceCandidateData {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
}
