'use client';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export default function VideoCall({ onHangUp }: VideoCallProps) {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const peerConnection = new RTCPeerConnection(servers);
    setPc(peerConnection);

    const setupMedia = async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      setWebcamActive(true);
    };

    setupMedia();
    
    return () => {
        peerConnection.close();
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, []);

  const handleCreateCall = async () => {
    if (!pc) return;
    const callDoc = doc(collection(db, 'calls'));
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');
    setCallId(callDoc.id);

    pc.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await setDoc(callDoc, { offer });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  const handleAnswerCall = async (id: string) => {
    if (!pc) return;
    setCallId(id);
    const callDoc = doc(db, 'calls', id);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    pc.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data();
    if(callData?.offer) {
        const offerDescription = new RTCSessionDescription(callData.offer);
        await pc.setRemoteDescription(offerDescription);

        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
        await setDoc(callDoc, { answer }, { merge: true });
    }

    onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                pc.addIceCandidate(candidate);
            }
        });
    });
  };

  const handleToggleMute = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const handleToggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      });
    }
  };

  const handleHangupCleanup = async () => {
    if(callId) {
        const callDocRef = doc(db, 'calls', callId);
        const offerCandidatesQuery = query(collection(callDocRef, 'offerCandidates'));
        const answerCandidatesQuery = query(collection(callDocRef, 'answerCandidates'));
        
        const batch = writeBatch(db);

        const offerCandidatesSnapshot = await getDocs(offerCandidatesQuery);
        offerCandidatesSnapshot.forEach(doc => batch.delete(doc.ref));

        const answerCandidatesSnapshot = await getDocs(answerCandidatesQuery);
        answerCandidatesSnapshot.forEach(doc => batch.delete(doc.ref));

        batch.delete(callDocRef);

        await batch.commit();
    }

    pc?.close();
    onHangUp();
  }


  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-background/80 backdrop-blur-sm">
      <div className="relative flex-1">
        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 h-32 w-48 rounded-lg border-2 border-primary object-cover shadow-lg" />
      </div>

      {!webcamActive && (
        <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-foreground">Starting webcam...</p>
        </div>
      )}
      
      {!callId && webcamActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
             <Button onClick={handleCreateCall} size="lg" className="bg-green-600 hover:bg-green-700">Start Call</Button>
             <p className="text-foreground">Or ask your friend to start a call and join it.</p>
        </div>
      )}

      <div className="flex justify-center gap-4 bg-background/50 p-4">
        <Button onClick={handleToggleMute} variant={isMuted ? 'destructive': 'secondary'} size="icon" className="rounded-full">
            {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button onClick={handleToggleVideo} variant={isVideoOff ? 'destructive': 'secondary'} size="icon" className="rounded-full">
            {isVideoOff ? <VideoOff /> : <Video />}
        </Button>
        <Button onClick={handleHangupCleanup} variant="destructive" size="icon" className="rounded-full">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
