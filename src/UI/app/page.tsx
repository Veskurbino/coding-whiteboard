"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useWhiteboardStore } from '../src/state/whiteboardStore';

export default function HomePage() {
  const router = useRouter();
  const { setSessionId } = useWhiteboardStore();
  const [inputId, setInputId] = useState('');

  const join = () => {
    if (!inputId.trim()) return;
    setSessionId(inputId.trim());
    router.push(`/board/${inputId.trim()}`);
  };
  const createNew = () => {
    const id = nanoid(10);
    setSessionId(id);
    router.push(`/board/${id}`);
  };

  const placeholder = 'e.g. kt9v2a3b1c';

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold">Coding Whiteboard</h1>
        <p className="opacity-70 mt-2">Real-time collaborative notes and code snippets on an infinite canvas.</p>

        <div className="mt-10 grid gap-4">
          <label className="text-sm opacity-80">Join an existing session</label>
          <div className="flex gap-2">
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder={placeholder}
              className="flex-1 border rounded px-3 py-2 bg-transparent"
            />
            <button onClick={join} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={!inputId.trim()}>Join</button>
            <button onClick={() => setInputId(nanoid(10))} className="px-3 py-2 rounded border">Generate</button>
          </div>

          <div className="mt-8">
            <label className="text-sm opacity-80">Or create a new session</label>
            <div className="mt-2">
              <button onClick={createNew} className="px-4 py-2 rounded bg-green-600 text-white">Create new session</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


