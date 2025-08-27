import type { WhiteboardDocument } from "@/types/whiteboard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // set later

export async function saveBoard(board: WhiteboardDocument): Promise<void> {
  try {
    if (!API_BASE) throw new Error("No API base configured");
    await fetch(`${API_BASE}/boards/${board.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(board),
    });
  } catch (err) {
    // offline fallback: persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`board:${board.id}`, JSON.stringify(board));
    }
  }
}

export async function loadBoard(boardId: string): Promise<WhiteboardDocument | undefined> {
  try {
    if (!API_BASE) throw new Error("No API base configured");
    const res = await fetch(`${API_BASE}/boards/${boardId}`);
    if (!res.ok) throw new Error("Not OK");
    return (await res.json()) as WhiteboardDocument;
  } catch (err) {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(`board:${boardId}`);
      if (raw) return JSON.parse(raw);
    }
    return undefined;
  }
}

export type SaveEvent = { at: number; size: number };


