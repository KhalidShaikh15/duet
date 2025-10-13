'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  doc,
  writeBatch,
  where,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import type { Message, User, CallData, IceCandidateData } from '@/lib/types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import AISummary from './AISummary';
import VideoCallView from './VideoCallView';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChatId, cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { Phone, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatWindowProps {
  currentUser: User;
  otherUser: User;
}

// Stun servers for WebRTC
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function ChatWindow({ currentUser, otherUser }: ChatWindowProps) {
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const { toast } = useToast();

  // Video Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const pc = useRef<RTCPeerConnection | null>(null);
  const callDocRef = useRef<any>(null);


  const setupStreams = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    const remote = new MediaStream();
    setRemoteStream(remote);
    return { local: stream, remote };
  }, []);

  const initializePeerConnection = useCallback((local: MediaStream, remote: MediaStream) => {
    pc.current = new RTCPeerConnection(servers);

    local.getTracks().forEach((track) => {
      pc.current?.addTrack(track, local);
    });

    pc.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remote.addTrack(track);
      });
    };
  }, []);

  const startCall = useCallback(async () => {
    if (!firestore || !chatId) return;
    
    setIsCallActive(true);
    callDocRef.current = doc(firestore, 'calls', chatId);
    const offerCandidates = collection(callDocRef.current, 'offerCandidates');
    const answerCandidates = collection(callDocRef.current, 'answerCandidates');
    
    const { local, remote } = await setupStreams();
    initializePeerConnection(local, remote);

    pc.current!.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offerDescription = await pc.current!.createOffer();
    await pc.current!.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDocRef.current, { 
        offer, 
        callerId: currentUser.uid, 
        calleeId: otherUser.uid,
        status: 'pending'
    });

    // Listen for answer
    onSnapshot(callDocRef.current, (snapshot) => {
      const data = snapshot.data();
      if (!pc.current?.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.current?.setRemoteDescription(answerDescription);
      }
    });

    // Listen for ICE candidates from callee
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current?.addIceCandidate(candidate);
        }
      });
    });

  }, [firestore, chatId, setupStreams, initializePeerConnection, currentUser.uid, otherUser.uid]);

  const answerCall = useCallback(async () => {
      if (!firestore || !chatId || !callDocRef.current) return;
      setIsReceivingCall(false);
      setIsCallActive(true);

      const offerCandidates = collection(callDocRef.current, 'offerCandidates');
      const answerCandidates = collection(callDocRef.current, 'answerCandidates');

      const { local, remote } = await setupStreams();
      initializePeerConnection(local, remote);
      
      pc.current!.onicecandidate = async (event) => {
          if (event.candidate) {
              await addDoc(answerCandidates, event.candidate.toJSON());
          }
      };

      const callDocSnap = await getDoc(callDocRef.current);
      const callData = callDocSnap.data() as CallData;
      
      if (callData.offer) {
        await pc.current!.setRemoteDescription(new RTCSessionDescription(callData.offer));

        const answerDescription = await pc.current!.createAnswer();
        await pc.current!.setLocalDescription(answerDescription);

        const answer = {
          sdp: answerDescription.sdp,
          type: answerDescription.type,
        };

        await updateDoc(callDocRef.current, { answer, status: 'active' });

        onSnapshot(offerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                }
            });
        });
      }

  }, [firestore, chatId, setupStreams, initializePeerConnection]);


  const hangUp = useCallback(async () => {
    if (pc.current) {
        pc.current.getTransceivers().forEach(transceiver => {
            transceiver.stop();
        });
        pc.current.close();
    }
    
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    setLocalStream(null);
    setRemoteStream(null);
    pc.current = null;
    
    if (callDocRef.current) {
        await updateDoc(callDocRef.current, { status: 'ended' });
        // Consider deleting the doc or cleaning up candidates after a delay
    }

    setIsCallActive(false);
    setIsReceivingCall(false);
    callDocRef.current = null;
    toast({ title: "Call Ended" });
  }, [localStream, remoteStream, toast]);

  // Listen for incoming calls
  useEffect(() => {
      if (!firestore || !currentUser?.uid) return;
      const q = query(collection(firestore, 'calls'), where('calleeId', '==', currentUser.uid), where('status', '==', 'pending'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
              const call = snapshot.docs[0];
              if(getChatId(call.data().callerId, call.data().calleeId) === getChatId(currentUser.uid, otherUser.uid)) {
                callDocRef.current = call.ref;
                setIsReceivingCall(true);
              }
          }
      });
      return unsubscribe;
  }, [firestore, currentUser?.uid, otherUser.uid]);

  // Listen for hang up
   useEffect(() => {
    if (isCallActive && callDocRef.current) {
      const unsubscribe = onSnapshot(callDocRef.current, (doc) => {
        const data = doc.data();
        if (data?.status === 'ended') {
          hangUp();
        }
      });
      return unsubscribe;
    }
  }, [isCallActive, hangUp]);


  useEffect(() => {
    if (!currentUser?.uid || !otherUser?.uid || !firestore) return;

    const newChatId = getChatId(currentUser.uid, otherUser.uid);
    setChatId(newChatId);
    setMessages([]);

    // End any active call when switching chats
    if(isCallActive) {
      hangUp();
    }

    const markMessagesAsRead = async () => {
      const messagesRef = collection(firestore, 'chats', newChatId, 'messages');
      const q = query(messagesRef, where('senderId', '==', otherUser.uid), where('read', '==', false));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const batch = writeBatch(firestore);
        querySnapshot.forEach(doc => {
          batch.update(doc.ref, { read: true });
        });

        const currentUserRef = doc(firestore, 'users', currentUser.uid);
        batch.update(currentUserRef, {
          [`unreadFrom.${otherUser.uid}`]: 0,
        });

        await batch.commit();
      }
    };
    
    markMessagesAsRead();

    const userDocRef = doc(firestore, 'users', otherUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()) {
            setChatPartner({ uid: doc.id, ...doc.data() } as User);
        } else {
            setChatPartner(null);
        }
    });

    const messagesColRef = collection(firestore, 'chats', newChatId, 'messages');
    const qMessages = query(
      messagesColRef,
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribeMessages = onSnapshot(qMessages, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      markMessagesAsRead();
    }, (error) => {
        console.error("Error fetching messages:", error);
    });

    return () => {
        unsubscribeUser();
        unsubscribeMessages();
        if(isCallActive) {
          hangUp();
        }
    };
  }, [currentUser, otherUser, firestore, isCallActive, hangUp]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            setTimeout(() => {
                 viewport.scrollTop = viewport.scrollHeight;
            }, 100);
        }
    }
  }, [messages]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }
  
  return (
    <div className="relative flex h-full flex-col bg-background">
        { isCallActive && localStream && remoteStream && (
            <VideoCallView 
                localStream={localStream}
                remoteStream={remoteStream}
                onHangUp={hangUp}
            />
        )}
        <div className={cn('flex h-full flex-col', { 'hidden': isCallActive })}>
            {chatPartner && currentUser ? (
                <>
                <header className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(chatPartner.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-headline text-xl font-semibold">{chatPartner.username}</h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", chatPartner.isOnline ? 'bg-green-500' : 'bg-gray-400')} />
                            {chatPartner.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AISummary messages={messages.slice(-10)} />
                       {isReceivingCall ? (
                            <Button onClick={answerCall} variant="outline" className="animate-pulse border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                                <Phone className="mr-2 h-4 w-4"/>
                                Answer Call
                            </Button>
                       ) : (
                           <Button onClick={startCall} variant="ghost" size="icon">
                                <Video className="h-5 w-5" />
                                <span className="sr-only">Start Video Call</span>
                           </Button>
                       )}
                    </div>
                </header>
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === currentUser.uid} />
                    ))}
                    </div>
                </ScrollArea>
                <div className="border-t p-4">
                    {chatId && <ChatInput chatId={chatId} senderId={currentUser.uid} receiverId={otherUser.uid} />}
                </div>
                </>
            ) : (
                 <div className="flex h-full items-center justify-center bg-background">
                    <div className="text-center">
                    <h1 className="font-headline text-2xl text-foreground">
                        Select a user
                    </h1>
                    <p className="text-muted-foreground">
                        Choose someone from the list to start a conversation.
                    </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
