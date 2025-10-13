'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCallViewProps {
  localStream: MediaStream;
  remoteStream: MediaStream;
  onHangUp: () => void;
}

export default function VideoCallView({ localStream, remoteStream, onHangUp }: VideoCallViewProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMic = () => {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsMicMuted(!track.enabled);
    });
  };

  const toggleCamera = () => {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsCameraOff(!track.enabled);
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex h-full w-full flex-col bg-black">
      <div className="relative flex-1">
        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 h-48 w-36 rounded-lg border-2 border-white object-cover shadow-lg" />
      </div>
      <div className="flex items-center justify-center gap-4 bg-gray-900 p-4">
        <Button onClick={toggleMic} variant="secondary" size="icon" className={cn("rounded-full", isMicMuted && 'bg-destructive')}>
          {isMicMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          <span className="sr-only">{isMicMuted ? 'Unmute' : 'Mute'}</span>
        </Button>
        <Button onClick={onHangUp} variant="destructive" size="icon" className="h-14 w-14 rounded-full">
          <PhoneOff className="h-7 w-7" />
          <span className="sr-only">Hang Up</span>
        </Button>
         <Button onClick={toggleCamera} variant="secondary" size="icon" className={cn("rounded-full", isCameraOff && 'bg-destructive')}>
          {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          <span className="sr-only">{isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}</span>
        </Button>
      </div>
    </div>
  );
}
