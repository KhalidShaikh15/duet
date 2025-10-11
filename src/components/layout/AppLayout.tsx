'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import VideoCall from '@/components/video/VideoCall';

export default function AppLayout() {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  return (
    <div className="flex h-screen w-full bg-secondary">
      <Sidebar />
      <main className="flex flex-1 flex-col">
        {isVideoCallActive && (
          <VideoCall onHangUp={() => setIsVideoCallActive(false)} />
        )}
        <ChatWindow onStartVideoCall={() => setIsVideoCallActive(true)} isVidCamOn={isVideoCallActive} />
      </main>
    </div>
  );
}
