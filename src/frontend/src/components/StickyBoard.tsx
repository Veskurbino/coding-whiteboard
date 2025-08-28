"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeEditorModal } from "@/components/CodeEditorModal";

type StickyNote = {
  id: string;
  x: number; // integer grid X
  y: number; // integer grid Y
  text: string;
  isCode?: boolean;
  code?: string;
  language?: string;
};

type DragState = {
  id: string;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
} | null;

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function StickyBoard(): JSX.Element {
  // Config
  const gridSize = 100; // px size of a grid cell
  const noteWidth = 92; // visual width inside a cell
  const noteHeight = 92; // visual height inside a cell

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [scale, setScale] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [panDrag, setPanDrag] = useState<{
    startClientX: number;
    startClientY: number;
    originPanX: number;
    originPanY: number;
  } | null>(null);
  const [zoomDrag, setZoomDrag] = useState<{
    startScreenX: number;
    startScreenY: number;
    anchorWorldX: number;
    anchorWorldY: number;
    startScale: number;
  } | null>(null);
  const [clickStart, setClickStart] = useState<{
    startClientX: number;
    startClientY: number;
    originPanX: number;
    originPanY: number;
  } | null>(null);
  const [codeModal, setCodeModal] = useState<{ id: string; initialCode: string; language: string } | null>(null);

  // Compute board offset to translate client coords to board-local coords
  const getBoardRect = useCallback(() => {
    const rect = boardRef.current?.getBoundingClientRect();
    return rect;
  }, []);

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = getBoardRect();
    const sx = clientX - (rect?.left ?? 0);
    const sy = clientY - (rect?.top ?? 0);
    const wx = (sx - panX) / scale;
    const wy = (sy - panY) / scale;
    return { wx, wy };
  }, [getBoardRect, panX, panY, scale]);

  const clientToGrid = useCallback((clientX: number, clientY: number) => {
    const { wx, wy } = screenToWorld(clientX, clientY);
    const gx = Math.floor(wx / gridSize);
    const gy = Math.floor(wy / gridSize);
    return { gx, gy };
  }, [screenToWorld, gridSize]);

  const occupiedByCell = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of notes) m.set(`${n.x},${n.y}`, n.id);
    return m;
  }, [notes]);

  const getOccupant = useCallback((gx: number, gy: number, ignoreId?: string) => {
    const id = occupiedByCell.get(`${gx},${gy}`);
    if (id && id !== ignoreId) return id;
    return undefined;
  }, [occupiedByCell]);

  // Create note when clicking empty space
  const handleBoardMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Middle button: start zoom drag (anchor at cursor)
    if (e.button === 1) {
      e.preventDefault();
      const rect = getBoardRect();
      const sx = e.clientX - (rect?.left ?? 0);
      const sy = e.clientY - (rect?.top ?? 0);
      const anchorWorldX = (sx - panX) / scale;
      const anchorWorldY = (sy - panY) / scale;
      setZoomDrag({ startScreenX: sx, startScreenY: sy, anchorWorldX, anchorWorldY, startScale: scale });
      return;
    }
    // Left button on empty: start click/pan threshold tracking
    if (e.button === 0) {
      if ((e.target as HTMLElement).closest("[data-note]") !== null) return; // note handles its own
      setClickStart({ startClientX: e.clientX, startClientY: e.clientY, originPanX: panX, originPanY: panY });
    }
  }, [clientToGrid, getOccupant, panX, panY, scale, getBoardRect]);

  // Select, start drag on mousedown of a note
  const onNoteMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedId(id);
    setEditingId((curr) => (curr === id ? id : null));

    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setDrag({ id, startClientX: e.clientX, startClientY: e.clientY, originX: note.x, originY: note.y });
  }, [notes]);

  // Drag handling on window to allow smoother drags
  useEffect(() => {
    function onMove(e: MouseEvent) {
      // Evaluate click-to-pan threshold if started on empty area
      if (clickStart && !panDrag) {
        const dx0 = e.clientX - clickStart.startClientX;
        const dy0 = e.clientY - clickStart.startClientY;
        const dist = Math.hypot(dx0, dy0);
        const threshold = Math.max(6 * (window.devicePixelRatio || 1), 6);
        if (dist > threshold) {
          setPanDrag({ startClientX: e.clientX, startClientY: e.clientY, originPanX: clickStart.originPanX, originPanY: clickStart.originPanY });
        }
      }

      // Note drag (left button)
      if (drag) {
        const dx = (e.clientX - drag.startClientX) / scale;
        const dy = (e.clientY - drag.startClientY) / scale;
        const gx = Math.round(drag.originX + dx / gridSize);
        const gy = Math.round(drag.originY + dy / gridSize);
        setNotes((prev) => {
          const occupant = prev.find((n) => n.x === gx && n.y === gy && n.id !== drag.id);
          if (occupant) return prev; // block overlapping move
          return prev.map((n) => (n.id === drag.id ? { ...n, x: gx, y: gy } : n));
        });
      }

      // Pan drag (right button)
      if (panDrag) {
        const dx = e.clientX - panDrag.startClientX;
        const dy = e.clientY - panDrag.startClientY;
        setPanX(panDrag.originPanX + dx);
        setPanY(panDrag.originPanY + dy);
      }

      // Zoom drag (middle button)
      if (zoomDrag) {
        const dy = e.clientY - zoomDrag.startScreenY;
        const factor = Math.exp(-dy * 0.003);
        const nextScaleUnclamped = zoomDrag.startScale * factor;
        const nextScale = Math.min(4, Math.max(0.2, nextScaleUnclamped));
        const nextPanX = zoomDrag.startScreenX - zoomDrag.anchorWorldX * nextScale;
        const nextPanY = zoomDrag.startScreenY - zoomDrag.anchorWorldY * nextScale;
        setScale(nextScale);
        setPanX(nextPanX);
        setPanY(nextPanY);
      }
    }

    function onUp() {
      if (drag) setDrag(null);
      if (panDrag) setPanDrag(null);
      if (clickStart && !panDrag) {
        // Treat as click release: create/select on empty cell
        const lastX = clickStart.startClientX;
        const lastY = clickStart.startClientY;
        const { gx, gy } = clientToGrid(lastX, lastY);
        const occupant = getOccupant(gx, gy);
        if (occupant) {
          setSelectedId(occupant);
          setEditingId(occupant);
        } else {
          const id = generateId();
          const newNote: StickyNote = { id, x: gx, y: gy, text: "" };
          setNotes((prev) => [...prev, newNote]);
          setSelectedId(id);
          setEditingId(id);
        }
      }
      if (clickStart) setClickStart(null);
      if (zoomDrag) setZoomDrag(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, gridSize, scale, panDrag, zoomDrag, clickStart, clientToGrid, getOccupant]);

  // Keyboard: Delete deletes selected note if not editing
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (editingId) return; // do not delete while editing text
        if (!selectedId) return;
        setNotes((prev) => prev.filter((n) => n.id !== selectedId));
        setSelectedId(null);
      }
      if (e.key === "Escape") {
        setEditingId(null);
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingId, selectedId]);

  const onNoteDoubleClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(id);
    const note = notes.find((n) => n.id === id);
    if (note?.isCode) {
      setEditingId(null);
      setCodeModal({ id, initialCode: note.code || "", language: note.language || "typescript" });
    } else {
      setEditingId(id);
    }
  }, [notes]);

  const onBoardDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-note]") !== null) return;
    // double click empty also creates and focuses edit
    const { gx, gy } = clientToGrid(e.clientX, e.clientY);
    const id = generateId();
    const newNote: StickyNote = { id, x: gx, y: gy, text: "" };
    setNotes((prev) => [...prev, newNote]);
    setSelectedId(id);
    setEditingId(id);
  }, [clientToGrid]);

  const gridBackground = useMemo(() => {
    const cell = gridSize * scale;
    const mod = (v: number, m: number) => ((v % m) + m) % m;
    const offsetX = mod(panX, cell);
    const offsetY = mod(panY, cell);
    return {
      backgroundSize: `${cell}px ${cell}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`,
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`,
    } as React.CSSProperties;
  }, [gridSize, scale, panX, panY]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Disable wheel-based scroll/zoom to avoid page scroll and jitter
    e.preventDefault();
  }, []);

  return (
    <div
      ref={boardRef}
      onWheel={handleWheel}
      onMouseDown={handleBoardMouseDown}
      onDoubleClick={onBoardDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full h-full relative select-none overflow-hidden"
      style={{ background: "#fafafa", ...gridBackground }}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${panX}px, ${panY}px) scale(${scale})`, transformOrigin: "0 0" }}
      >
      {notes.map((note) => {
        const left = note.x * gridSize + (gridSize - noteWidth) / 2;
        const top = note.y * gridSize + (gridSize - noteHeight) / 2;
        const isSelected = selectedId === note.id;
        const isEditing = editingId === note.id;
        return (
          <div
            key={note.id}
            data-note
            onMouseDown={(e) => onNoteMouseDown(note.id, e)}
            onDoubleClick={(e) => onNoteDoubleClick(note.id, e)}
            style={{ left, top, width: noteWidth, height: noteHeight }}
            className={`absolute shadow-md transition-shadow ${isSelected ? "ring-2 ring-blue-500" : "ring-1 ring-neutral-300"}`}
          >
            <div className="w-full h-full rounded-[6px]" style={{
              background: note.isCode ? "#D6E8FF" : "#F9E27D",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
            }}>
              <div className="w-full h-3 rounded-t-[6px]" style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0))",
              }} />
              {!note.isCode && isEditing ? (
                <textarea
                  autoFocus
                  value={note.text}
                  onChange={(e) => setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, text: e.target.value } : n))}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      setEditingId(null);
                    }
                    e.stopPropagation();
                  }}
                  className="w-full h-[calc(100%-12px)] resize-none bg-transparent outline-none p-2 text-sm"
                  placeholder="Type..."
                />
              ) : (
                <div className="p-2 text-sm whitespace-pre-wrap leading-tight flex items-center justify-center text-center" style={{ color: "#2b2b2b" }}>
                  {note.isCode ? "CODE" : (note.text || <span className="opacity-40">(empty)</span>)}
                </div>
              )}
            </div>
            {/* toggle and folded corner */}
            <button
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, isCode: !n.isCode } : n));
              }}
              title={note.isCode ? "Switch to text" : "Switch to code"}
              className="absolute right-1 bottom-1 w-6 h-6 rounded-full border flex items-center justify-center bg-white/70 hover:bg-white"
              style={{ borderColor: note.isCode ? "#2563eb" : "#9ca3af" }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: note.isCode ? "#2563eb" : "#9ca3af" }} />
            </button>
            <div className="absolute right-0 bottom-0 w-5 h-5" style={{
              background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%)",
              borderBottomRightRadius: 6,
            }} />
          </div>
        );
      })}
      <CodeEditorModal
        isOpen={!!codeModal}
        initialCode={codeModal?.initialCode || ""}
        language={codeModal?.language || "typescript"}
        onClose={() => setCodeModal(null)}
        onSave={(code, lang) => {
          if (!codeModal) return;
          setNotes((prev) => prev.map((n) => n.id === codeModal.id ? { ...n, code, language: lang, isCode: true } : n));
          setCodeModal(null);
        }}
      />
      </div>
    </div>
  );
}


