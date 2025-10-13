'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCallViewProps {
  localStream: MediaStream;
  remoteStream: MediaStream;
  onHangUp: () => void;
}

export default function VideoCallView({ localStream, remoteStream, onHangUp }: VideoCallViewProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragStartPos = useRef({ x: 0, y: 0 });

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const parentRect = containerRef.current.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    let newX = e.clientX - dragStartPos.current.x;
    let newY = e.clientY - dragStartPos.current.y;

    // Constrain movement within the parent
    newX = Math.max(0, Math.min(newX, parentRect.width - containerRef.current.offsetWidth));
    newY = Math.max(0, Math.min(newY, parentRect.height - containerRef.current.offsetHeight));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  return (
    <div
      ref={containerRef}
      className="absolute z-50 flex h-[400px] w-[300px] flex-col rounded-lg bg-black shadow-2xl overflow-hidden border-2 border-primary"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <div 
        onMouseDown={handleMouseDown}
        className="flex items-center justify-center py-1 bg-primary text-primary-foreground cursor-move"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="relative flex-1">
        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-2 right-2 h-24 w-20 rounded-md border border-white object-cover shadow-lg" />
      </div>
      <div className="flex items-center justify-center gap-2 bg-gray-900/80 p-2">
        <Button onClick={toggleMic} variant="secondary" size="icon" className={cn("rounded-full h-10 w-10", isMicMuted && 'bg-destructive')}>
          {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span className="sr-only">{isMicMuted ? 'Unmute' : 'Mute'}</span>
        </Button>
        <Button onClick={onHangUp} variant="destructive" size="icon" className="h-12 w-12 rounded-full">
          <PhoneOff className="h-6 w-6" />
          <span className="sr-only">Hang Up</span>
        </Button>
         <Button onClick={toggleCamera} variant="secondary" size="icon" className={cn("rounded-full h-10 w-10", isCameraOff && 'bg-destructive')}>
          {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          <span className="sr-only">{isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}</span>
        </Button>
      </div>
    </div>
  );
}
