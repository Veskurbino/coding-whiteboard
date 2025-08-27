"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
function generateId(): string {
  // Prefer Web Crypto API if available
  try {
    // @ts-ignore - TS may not know about crypto in some contexts
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
import type {
  Tool,
  WhiteboardDocument,
  WhiteboardElement,
  RectElement,
  EllipseElement,
  ArrowElement,
  TextElement,
  CodeElement,
  NewElementInput,
} from "@/types/whiteboard";

type WhiteboardState = {
  activeTool: Tool;
  board?: WhiteboardDocument;
  stageRef?: any;
  getSelectedElement: () => WhiteboardElement | undefined;
  setActiveTool: (tool: Tool) => void;
  startNewBoard: (id: string) => void;
  setViewport: (x: number, y: number, scale: number) => void;
  addElement: (el: NewElementInput) => string;
  updateElement: (id: string, updater: (el: WhiteboardElement) => WhiteboardElement) => void;
  selectElement: (id?: string) => void;
  clearBoard: () => void;
  setElements: (els: WhiteboardElement[]) => void;
  setStageRef: (ref: any) => void;
  getStageDataURL: () => string | undefined;
  deleteSelected: () => void;
};

export const useWhiteboardStore = create<WhiteboardState>()(
  devtools((set, get) => ({
    activeTool: "select",
    setActiveTool: (tool) => set({ activeTool: tool }),
    getSelectedElement: () => get().board?.elements.find((e) => e.selected),
    startNewBoard: (id) =>
      set({
        board: {
          id,
          title: "Untitled Board",
          elements: [],
          viewport: { x: 0, y: 0, scale: 1 },
          updatedAt: Date.now(),
        },
      }),
    setViewport: (x, y, scale) =>
      set((state) =>
        state.board
          ? { board: { ...state.board, viewport: { x, y, scale }, updatedAt: Date.now() } }
          : state
      ),
    addElement: (el) => {
      const id = generateId();
      set((state) => {
        if (!state.board) return state;
        const newEl: WhiteboardElement = {
          ...el,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as WhiteboardElement;
        return {
          board: { ...state.board, elements: [...state.board.elements, newEl], updatedAt: Date.now() },
        };
      });
      return id;
    },
    updateElement: (id, updater) =>
      set((state) => {
        if (!state.board) return state;
        const elements = state.board.elements.map((e) => (e.id === id ? { ...updater(e), updatedAt: Date.now() } : e));
        return { board: { ...state.board, elements, updatedAt: Date.now() } };
      }),
    selectElement: (id) =>
      set((state) => {
        if (!state.board) return state;
        const elements = state.board.elements.map((e) => ({ ...e, selected: id ? e.id === id : false }));
        return { board: { ...state.board, elements } };
      }),
    clearBoard: () => set((state) => (state.board ? { board: { ...state.board, elements: [] } } : state)),
    setElements: (els) => set((state) => (state.board ? { board: { ...state.board, elements: els } } : state)),
    setStageRef: (ref) => set({ stageRef: ref }),
    getStageDataURL: () => {
      const s = get();
      try {
        return s.stageRef?.toDataURL({ pixelRatio: 2 });
      } catch {
        return undefined;
      }
    },
    deleteSelected: () => set((state) => {
      if (!state.board) return state;
      const filtered = state.board.elements.filter((e) => !e.selected && (!e.groupId || !state.board?.elements.find((x) => x.id === e.groupId)?.selected));
      return { board: { ...state.board, elements: filtered, updatedAt: Date.now() } };
    }),
  }))
);

export type { WhiteboardDocument, WhiteboardElement, RectElement, EllipseElement, ArrowElement, TextElement, CodeElement, Tool };


