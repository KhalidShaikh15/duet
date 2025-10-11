'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  updateDoc,
  getDoc,
  DocumentReference,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { Call } from '@/lib/types';


const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface VideoCallProps {
  onHangUp: () => void;
  callId: string;
  currentUser: string;
}

export default function VideoCall({ onHangUp, callId, currentUser }: VideoCallProps) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const { toast } = useToast();

  const cleanup = useCallback(async (isInitiator: boolean) => {
    if (pcRef.current) {
        pcRef.current.getTransceivers().forEach(transceiver => {
            transceiver.stop();
        });
        pcRef.current.close();
        pcRef.current = null;
    }
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (isInitiator) {
        try {
            const callDocRef = doc(db, 'calls', callId);
            const offerCandidatesQuery = collection(callDocRef, 'offerCandidates');
            const answerCandidatesQuery = collection(callDocRef, 'answerCandidates');
            
            const batch = writeBatch(db);

            const offerCandidatesSnapshot = await getDocs(offerCandidatesQuery);
            offerCandidatesSnapshot.forEach(doc => batch.delete(doc.ref));

            const answerCandidatesSnapshot = await getDocs(answerCandidatesQuery);
            answerCandidatesSnapshot.forEach(doc => batch.delete(doc.ref));

            batch.delete(callDocRef);

            await batch.commit();
        } catch (error) {
            console.error("Error cleaning up call documents:", error);
        }
    }
  }, [callId]);

  const handleHangUp = useCallback(async () => {
    await cleanup(true);
    onHangUp();
  }, [cleanup, onHangUp]);

  useEffect(() => {
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;
    let isMounted = true;

    const setupMediaAndCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (!isMounted) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            localStreamRef.current = stream;
            setHasCameraPermission(true);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });
        } catch (error) {
            console.error('Error accessing camera/mic:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Media Access Denied',
                description: 'Please enable camera and microphone permissions to make a call.',
            });
            await cleanup(true);
            onHangUp();
            return;
        }

        pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        const callDocRef = doc(db, 'calls', callId);
        const callDocSnap = await getDoc(callDocRef);

        if (callDocSnap.exists() && callDocSnap.data().offer) {
            await answerCall(pc, callDocRef);
        } else {
            await createCall(pc, callDocRef);
        }
    };
    
    setupMediaAndCall();

    const handleBeforeUnload = () => {
      if (isMounted) {
        handleHangUp();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        isMounted = false;
        handleHangUp();
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [callId, currentUser, onHangUp, toast, handleHangUp, cleanup]);


  const createCall = async (pc: RTCPeerConnection, callDocRef: DocumentReference) => {
    const offerCandidates = collection(callDocRef, 'offerCandidates');
    
    pc.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await setDoc(callDocRef, { offer, caller: currentUser });

    const unsubscribe = onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data() as Call;
      if (pc.signalingState !== 'closed' && !pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    const unsubscribeAnswerCandidates = onSnapshot(collection(callDocRef, 'answerCandidates'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          if (pc.signalingState !== 'closed') {
              pc.addIceCandidate(candidate);
          }
        }
      });
    });

    return () => {
      unsubscribe();
      unsubscribeAnswerCandidates();
    };
  };

  const answerCall = async (pc: RTCPeerConnection, callDocRef: DocumentReference) => {
    const callDocData = (await getDoc(callDocRef)).data() as Call;

    if (!callDocData || !callDocData.offer) return;

    pc.onicecandidate = (event) => {
      event.candidate && addDoc(collection(callDocRef, 'answerCandidates'), event.candidate.toJSON());
    };

    await pc.setRemoteDescription(new RTCSessionDescription(callDocData.offer));
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);
    const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
    await updateDoc(callDocRef, { answer, callee: currentUser });

    const unsubscribeOfferCandidates = onSnapshot(collection(callDocRef, 'offerCandidates'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          if (pc.signalingState !== 'closed') {
            pc.addIceCandidate(candidate);
          }
        }
      });
    });

     return () => {
      unsubscribeOfferCandidates();
    };
  };

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      });
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-black">
      <div className="relative flex-1">
        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
        <video ref={localVideoRef} autoPlay playsInline muted className={cn("absolute bottom-24 right-4 h-32 w-48 rounded-lg border-2 border-primary object-cover shadow-lg md:bottom-20", isVideoOff && 'bg-black')} />
      </div>

      {!hasCameraPermission && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Alert variant="destructive" className="m-4 max-w-sm">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                Please allow camera access in your browser settings to use video features.
                </AlertDescription>
            </Alert>
          </div>
      )}

      <div className="flex justify-center gap-4 bg-black/30 p-4">
        <Button onClick={handleToggleMute} variant={isMuted ? 'destructive': 'secondary'} size="icon" className="rounded-full" disabled={!hasCameraPermission}>
            {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button onClick={handleToggleVideo} variant={isVideoOff ? 'destructive': 'secondary'} size="icon" className="rounded-full" disabled={!hasCameraPermission}>
            {isVideoOff ? <VideoOff /> : <Video />}
        </Button>
        <Button onClick={handleHangUp} variant="destructive" size="icon" className="rounded-full">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
