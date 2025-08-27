"use client";
import { useEffect, useRef, useState } from "react";
import { useWhiteboardStore } from "@/store/whiteboardStore";
import { saveBoard, loadBoard } from "@/lib/api";

export function useAutosave(boardId: string) {
  const board = useWhiteboardStore((s) => s.board);
  const setElements = useWhiteboardStore((s) => s.setElements);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const timer = useRef<any>(null);

  // Load existing board if present
  useEffect(() => {
    (async () => {
      const existing = await loadBoard(boardId);
      if (existing) {
        // Only replace elements to preserve viewport/title set by store
        setElements(existing.elements);
      }
    })();
  }, [boardId, setElements]);

  useEffect(() => {
    if (!board) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveBoard(board);
      setLastSavedAt(Date.now());
    }, 600);
    return () => clearTimeout(timer.current);
  }, [board]);

  return { lastSavedAt };
}


