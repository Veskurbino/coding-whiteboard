'use client';
import { useEffect } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useWhiteboardStore } from '../state/whiteboardStore';

// Minimal Yjs integration for session presence. In a later iteration, map notes to a shared Y.Map
export function useYjs() {
  const sessionId = useWhiteboardStore((s) => s.sessionId);
  useEffect(() => {
    const doc = new Y.Doc();
    // Default local provider for quick start. Replace with backend-hosted ws later.
    const provider = new WebsocketProvider('wss://demos.yjs.dev', `coding-whiteboard-${sessionId}`, doc, { connect: true });
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [sessionId]);
}


