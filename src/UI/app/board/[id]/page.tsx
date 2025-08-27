'use client';
import dynamic from 'next/dynamic';
import { Toolbar } from '../../../src/components/Toolbar';
import { useWhiteboardStore } from '../../../src/state/whiteboardStore';
import { useEffect } from 'react';

const Whiteboard = dynamic(() => import('../../../src/components/Whiteboard'), { ssr: false });

export default function BoardIdPage({ params }: { params: { id: string } }) {
  const { sessionId, setSessionId } = useWhiteboardStore();
  useEffect(() => {
    if (params.id && params.id !== sessionId) setSessionId(params.id);
  }, [params.id, sessionId, setSessionId]);
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <Toolbar />
      <div className="flex-1">
        <Whiteboard key={sessionId} />
      </div>
    </div>
  );
}


