import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type Tool = 'select' | 'pan' | 'note' | 'code' | 'arrow';

export type UserInfo = {
  id: string;
  name: string;
};

export type Note = {
  id: string;
  type: 'note';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  tags: string[];
  color: string;
  createdBy: UserInfo;
  createdAt: number;
  updatedBy: UserInfo;
  updatedAt: number;
};

export type CodeBlock = {
  id: string;
  type: 'code';
  x: number;
  y: number;
  width: number;
  height: number;
  code: string;
  language: string;
  createdBy: UserInfo;
  createdAt: number;
  updatedBy: UserInfo;
  updatedAt: number;
};

export type ArrowEl = {
  id: string;
  type: 'arrow';
  fromId: string;
  toId: string;
  createdBy: UserInfo;
  createdAt: number;
  updatedBy: UserInfo;
  updatedAt: number;
};

export type Element = Note | CodeBlock | ArrowEl;

type WhiteboardState = {
  sessionId: string;
  currentUser: UserInfo;
  elements: Element[];
  selectedIds: string[];
  zoom: number;
  offsetX: number;
  offsetY: number;
  activeTool: Tool;
  pendingArrowFromId: string | null;
  setSessionId: (id: string) => void;
  setUserName: (name: string) => void;
  setTool: (tool: Tool) => void;
  addNote: (x: number, y: number, partial?: Partial<Note>) => void;
  addCodeBlock: (x: number, y: number, partial?: Partial<CodeBlock>) => void;
  addArrow: (fromId: string, toId: string) => void;
  updateElement: (id: string, updates: Partial<Note> | Partial<CodeBlock>) => void;
  select: (ids: string[]) => void;
  setViewport: (zoom: number, offsetX: number, offsetY: number) => void;
  removeElements: (ids: string[]) => void;
  setPendingArrowFrom: (id: string | null) => void;
  getDocument: () => any;
  setPNGProvider: (provider: (() => string) | null) => void;
  getPNGDataURL: () => string | null;
};

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  sessionId: nanoid(10),
  currentUser: { id: nanoid(8), name: 'Anonymous' },
  elements: [],
  selectedIds: [],
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  activeTool: 'select',
  pendingArrowFromId: null,
  setSessionId: (id) => set({ sessionId: id }),
  setUserName: (name) => set((state) => ({ currentUser: { ...state.currentUser, name } })),
  setTool: (tool) => set({ activeTool: tool, pendingArrowFromId: null }),
  addNote: (x, y, partial) => set((state) => ({
    elements: [
      ...state.elements,
      {
        id: nanoid(),
        type: 'note',
        x,
        y,
        width: 220,
        height: 140,
        text: 'New note',
        tags: [],
        color: '#FEF3C7',
        createdBy: state.currentUser,
        createdAt: Date.now(),
        updatedBy: state.currentUser,
        updatedAt: Date.now(),
        ...partial
      } as Note
    ]
  })),
  addCodeBlock: (x, y, partial) => set((state) => ({
    elements: [
      ...state.elements,
      {
        id: nanoid(),
        type: 'code',
        x,
        y,
        width: 420,
        height: 240,
        code: '// code',
        language: 'typescript',
        createdBy: state.currentUser,
        createdAt: Date.now(),
        updatedBy: state.currentUser,
        updatedAt: Date.now(),
        ...partial
      } as CodeBlock
    ]
  })),
  addArrow: (fromId, toId) => set((state) => ({
    elements: [
      ...state.elements,
      {
        id: nanoid(),
        type: 'arrow',
        fromId,
        toId,
        createdBy: state.currentUser,
        createdAt: Date.now(),
        updatedBy: state.currentUser,
        updatedAt: Date.now()
      } as ArrowEl
    ],
    pendingArrowFromId: null
  })),
  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates, updatedBy: state.currentUser, updatedAt: Date.now() } as Element : el))
  })),
  select: (ids) => set({ selectedIds: ids }),
  setViewport: (zoom, offsetX, offsetY) => set({ zoom, offsetX, offsetY }),
  removeElements: (ids) => set((state) => ({
    elements: state.elements.filter((el) => !ids.includes(el.id)),
    selectedIds: state.selectedIds.filter((id) => !ids.includes(id))
  })),
  setPendingArrowFrom: (id) => set({ pendingArrowFromId: id }),
  getDocument: () => ({
    id: get().sessionId,
    title: 'Board',
    elements: get().elements,
    viewport: { x: get().offsetX, y: get().offsetY, scale: get().zoom },
    updatedAt: Date.now()
  }),
  setPNGProvider: (provider) => {
    (get() as any).pngProvider = provider;
  },
  getPNGDataURL: () => {
    const prov = (get() as any).pngProvider as undefined | (() => string);
    return prov ? prov() : null;
  }
}));

// Initialize optional provider reference
(useWhiteboardStore as any).getState().pngProvider = null;


