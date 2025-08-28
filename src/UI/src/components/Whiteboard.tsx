'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Group, Rect, Text, Arrow, Line, Label, Tag } from 'react-konva';
import { useColorMode, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Textarea } from '@chakra-ui/react';
import { useWhiteboardStore, Note, Element, CodeBlock } from '../state/whiteboardStore';
import { useYjs } from '../yjs/useYjs';
import { CodeEditorModal } from './CodeEditorModal';

const GRID_SIZE = 40;
const NOTE_SIZE = { width: 220, height: 140 };
const CODE_SIZE = { width: 420, height: 240 };
const SNAP_PADDING = 16;
const SNAP_THRESHOLD = 64;

type BlockLike = { id: string; x: number; y: number; width: number; height: number };

function snapToGrid(x: number, y: number) {
  return {
    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(y / GRID_SIZE) * GRID_SIZE
  };
}

function toBlocks(elements: Element[], ignoreId?: string): BlockLike[] {
  return (elements as any[])
    .filter((el) => el.type !== 'arrow' && el.id !== ignoreId)
    .map((el: any) => ({ id: el.id, x: el.x, y: el.y, width: el.width, height: el.height }));
}

function overlaps(a: BlockLike, b: BlockLike, padding = SNAP_PADDING) {
  return !(
    a.x + a.width + padding <= b.x ||
    a.x >= b.x + b.width + padding ||
    a.y + a.height + padding <= b.y ||
    a.y >= b.y + b.height + padding
  );
}

function overlapsAny(pos: { x: number; y: number }, size: { width: number; height: number }, blocks: BlockLike[]) {
  const rect: BlockLike = { id: 'new', x: pos.x, y: pos.y, width: size.width, height: size.height };
  return blocks.some((b) => overlaps(rect, b));
}

function findNonOverlappingPosition(desired: { x: number; y: number }, size: { width: number; height: number }, blocks: BlockLike[], maxRadiusSteps = 24) {
  const snapped = snapToGrid(desired.x, desired.y);
  if (!overlapsAny(snapped, size, blocks)) return snapped;

  // Compute center helpers
  const centerOf = (r: { x: number; y: number; width: number; height: number }) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
  const rect = { x: snapped.x, y: snapped.y, width: size.width, height: size.height };
  const c = centerOf(rect);

  // Find nearest blocking block by center distance
  const nearest = blocks
    .map((b) => ({ b, dist: Math.hypot(centerOf(b).x - c.x, centerOf(b).y - c.y) }))
    .sort((a, b) => a.dist - b.dist)[0]?.b;

  // Primary push direction away from nearest blocker
  const directions: Array<[number, number]> = [];
  if (nearest) {
    const nb = centerOf(nearest);
    const vx = c.x - nb.x;
    const vy = c.y - nb.y;
    const ax = Math.abs(vx);
    const ay = Math.abs(vy);
    if (ax >= ay) {
      directions.push([vx >= 0 ? GRID_SIZE : -GRID_SIZE, 0]);
      directions.push([0, vy >= 0 ? GRID_SIZE : -GRID_SIZE]);
    } else {
      directions.push([0, vy >= 0 ? GRID_SIZE : -GRID_SIZE]);
      directions.push([vx >= 0 ? GRID_SIZE : -GRID_SIZE, 0]);
    }
  }
  // Add diagonals and opposite as fallbacks
  directions.push([GRID_SIZE, GRID_SIZE], [-GRID_SIZE, GRID_SIZE], [GRID_SIZE, -GRID_SIZE], [-GRID_SIZE, -GRID_SIZE], [GRID_SIZE, 0], [-GRID_SIZE, 0], [0, GRID_SIZE], [0, -GRID_SIZE]);

  // Walk along prioritized directions increasing radius until free
  for (const [dx, dy] of directions) {
    for (let r = 1; r <= maxRadiusSteps; r++) {
      const candidate = { x: snapped.x + dx * r, y: snapped.y + dy * r };
      const snappedCandidate = snapToGrid(candidate.x, candidate.y);
      if (!overlapsAny(snappedCandidate, size, blocks)) return snappedCandidate;
    }
  }

  // Exhaustive radial search as last resort
  const ringDirs: Array<[number, number]> = [
    [GRID_SIZE, 0], [-GRID_SIZE, 0], [0, GRID_SIZE], [0, -GRID_SIZE],
    [GRID_SIZE, GRID_SIZE], [-GRID_SIZE, GRID_SIZE], [GRID_SIZE, -GRID_SIZE], [-GRID_SIZE, -GRID_SIZE]
  ];
  for (let r = 1; r <= maxRadiusSteps; r++) {
    for (const [dx, dy] of ringDirs) {
      const candidate = { x: snapped.x + dx * r, y: snapped.y + dy * r };
      if (!overlapsAny(candidate, size, blocks)) return candidate;
    }
  }
  // Fallback to original snapped (should rarely happen)
  return snapped;
}

export default function Whiteboard() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { elements, updateElement, select, selectedIds, zoom, offsetX, offsetY, setViewport, activeTool, addNote, addCodeBlock, setTool, pendingArrowFromId, setPendingArrowFrom, addArrow } = useWhiteboardStore();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { colorMode } = useColorMode();
  const [noteEditor, setNoteEditor] = useState<{ id: string; text: string } | null>(null);
  const [codeEditor, setCodeEditor] = useState<{ id: string; code: string; language: string } | null>(null);

  useYjs();

  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = zoom;
    const mousePointTo = {
      x: stage.getPointerPosition()!.x / oldScale - offsetX / oldScale,
      y: stage.getPointerPosition()!.y / oldScale - offsetY / oldScale
    };
    const newScale = e.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition()!.x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition()!.y / newScale) * newScale
    };
    setViewport(newScale, newPos.x, newPos.y);
  };

  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [placementPreview, setPlacementPreview] = useState<{ x: number; y: number; width: number; height: number; type: 'note'|'code' } | null>(null);

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() !== 'canvas') return;
    if (activeTool === 'pan') {
      isPanningRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    } else if (activeTool === 'note' || activeTool === 'code') {
      if (placementPreview && placementPreview.type === activeTool) {
        // Ensure final position is snapped and non-overlapping
        const size = activeTool === 'note' ? NOTE_SIZE : CODE_SIZE;
        const blocks = toBlocks(elements);
        const pos = findNonOverlappingPosition({ x: placementPreview.x, y: placementPreview.y }, size, blocks);
        if (activeTool === 'note') addNote(pos.x, pos.y);
        if (activeTool === 'code') addCodeBlock(pos.x, pos.y);
      } else {
        const stage = stageRef.current;
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const worldX = (pointer.x - offsetX) / zoom;
        const worldY = (pointer.y - offsetY) / zoom;
        const size = activeTool === 'note' ? NOTE_SIZE : CODE_SIZE;
        const blocks = toBlocks(elements);
        const pos = findNonOverlappingPosition({ x: worldX, y: worldY }, size, blocks);
        if (activeTool === 'note') addNote(pos.x, pos.y);
        if (activeTool === 'code') addCodeBlock(pos.x, pos.y);
      }
      setPlacementPreview(null);
      setTool('select');
    }
  };
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const stage = stageRef.current;
    if (stage) {
      const p = stage.getPointerPosition();
      if (p) setCursorPos({ x: p.x, y: p.y });
      if (p && (activeTool === 'note' || activeTool === 'code')) {
        const worldX = (p.x - offsetX) / zoom;
        const worldY = (p.y - offsetY) / zoom;
        const size = activeTool === 'note' ? NOTE_SIZE : CODE_SIZE;
        const blocks = toBlocks(elements);
        const candidates: { x: number; y: number; dist: number }[] = [];
        for (const b of blocks) {
          const above = { x: b.x, y: b.y - SNAP_PADDING - size.height };
          const below = { x: b.x, y: b.y + b.height + SNAP_PADDING };
          const right = { x: b.x + b.width + SNAP_PADDING, y: b.y };
          const left = { x: b.x - SNAP_PADDING - size.width, y: b.y };
          candidates.push({ ...above, dist: Math.hypot(worldX - above.x, worldY - above.y) });
          candidates.push({ ...below, dist: Math.hypot(worldX - below.x, worldY - below.y) });
          candidates.push({ ...right, dist: Math.hypot(worldX - right.x, worldY - right.y) });
          candidates.push({ ...left, dist: Math.hypot(worldX - left.x, worldY - left.y) });
        }
        candidates.sort((a, b) => a.dist - b.dist);
        const desired = (candidates[0] && candidates[0].dist <= SNAP_THRESHOLD) ? { x: candidates[0].x, y: candidates[0].y } : { x: worldX, y: worldY };
        const snapped = findNonOverlappingPosition(desired, size, blocks);
        setPlacementPreview({ x: snapped.x, y: snapped.y, width: size.width, height: size.height, type: activeTool });
      } else if (placementPreview) {
        setPlacementPreview(null);
      }
    }
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setViewport(zoom, offsetX + dx, offsetY + dy);
  };
  const onMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    isPanningRef.current = false;
  };

  const stageRef = useRef<any>(null);

  // Register PNG provider for export
  useEffect(() => {
    const unregister = () => useWhiteboardStore.getState().setPNGProvider(null);
    useWhiteboardStore.getState().setPNGProvider(() => {
      const stage = stageRef.current as any;
      if (!stage) return '';
      return stage.toDataURL({ pixelRatio: 2 });
    });
    return unregister;
  }, []);

  const gridLines = useMemo(() => {
    const lines = [] as JSX.Element[];
    const cols = Math.ceil(dimensions.width / GRID_SIZE) + 2;
    const rows = Math.ceil(dimensions.height / GRID_SIZE) + 2;
    for (let i = -1; i < cols; i++) {
      lines.push(
        <Rect key={`v-${i}`} x={i * GRID_SIZE} y={-GRID_SIZE} width={1} height={(rows + 1) * GRID_SIZE} fill="#f1f5f9" />
      );
    }
    for (let j = -1; j < rows; j++) {
      lines.push(
        <Rect key={`h-${j}`} x={-GRID_SIZE} y={j * GRID_SIZE} width={(cols + 1) * GRID_SIZE} height={1} fill="#f1f5f9" />
      );
    }
    return lines;
  }, [dimensions]);

  return (
    <div ref={containerRef} className="h-full w-full" onWheel={handleWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <Stage ref={stageRef} width={dimensions.width} height={dimensions.height} scaleX={zoom} scaleY={zoom} x={offsetX} y={offsetY} draggable={false} onMouseDown={() => select([])}>
        <Layer>
          <Group>{gridLines}</Group>
          {placementPreview && (
            <Group x={placementPreview.x} y={placementPreview.y} listening={false} opacity={0.6}>
              <Rect width={placementPreview.width} height={placementPreview.height} fill={'#93C5FD'} opacity={0.2} cornerRadius={10} />
              <Rect width={placementPreview.width} height={placementPreview.height} stroke={'#3B82F6'} dash={[8, 4]} cornerRadius={10} />
            </Group>
          )}
          {elements.filter((el) => el.type !== 'arrow').map((el) => (
            <ElementView
              key={el.id}
              element={el}
              isSelected={selectedIds.includes(el.id)}
              onSelect={() => {
                if (activeTool === 'arrow') {
                  if (!pendingArrowFromId) setPendingArrowFrom(el.id);
                  else if (pendingArrowFromId && pendingArrowFromId !== el.id) {
                    addArrow(pendingArrowFromId, el.id);
                    setTool('select');
                  }
                } else select([el.id]);
              }}
              onChange={(updates) => updateElement(el.id, updates as any)}
              onEditNote={(id: string, text: string) => setNoteEditor({ id, text })}
              onEditCode={(id: string, code: string, language: string) => setCodeEditor({ id, code, language })}
            />
          ))}
          {elements.filter((el) => el.type === 'arrow').map((el) => (
            <ArrowView key={el.id} fromId={(el as any).fromId} toId={(el as any).toId} elements={elements} />
          ))}
          {/* Current user cursor label */}
          {cursorPos && (
            <Label x={cursorPos.x + 8} y={cursorPos.y + 8} opacity={0.9} listening={false}>
              <Tag fill={colorMode === 'light' ? '#111827' : '#1F2937'} cornerRadius={4} />
              <Text text={`@${useWhiteboardStore.getState().currentUser.name || 'User'}`} padding={6} fill={'#F9FAFB'} fontSize={12} />
            </Label>
          )}
        </Layer>
      </Stage>

      <Modal isOpen={!!noteEditor} onClose={() => setNoteEditor(null)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea value={noteEditor?.text || ''} onChange={(e) => setNoteEditor((prev) => (prev ? { ...prev, text: e.target.value } : prev))} rows={10} />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setNoteEditor(null)}>Cancel</Button>
            <Button colorScheme="blue" onClick={() => { if (noteEditor) { updateElement(noteEditor.id, { text: noteEditor.text } as any); setNoteEditor(null); } }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CodeEditorModal
        isOpen={!!codeEditor}
        initialCode={codeEditor?.code || ''}
        language={codeEditor?.language || 'typescript'}
        onClose={() => setCodeEditor(null)}
        onSave={(code, language) => {
          if (codeEditor) {
            updateElement(codeEditor.id, { code, language } as any);
            setCodeEditor(null);
          }
        }}
      />
    </div>
  );
}

function ElementView({ element, isSelected, onSelect, onChange, onEditNote, onEditCode }: { element: Element; isSelected: boolean; onSelect: () => void; onChange: (updates: Partial<Note> | Partial<CodeBlock>) => void; onEditNote: (id: string, text: string) => void; onEditCode: (id: string, code: string, language: string) => void }) {
  if (element.type === 'note') {
    return <NoteView note={element} isSelected={isSelected} onSelect={onSelect} onChange={onChange as any} onEdit={onEditNote} />;
  }
  if (element.type === 'code') {
    return <CodeBlockView block={element} isSelected={isSelected} onSelect={onSelect} onChange={onChange as any} onEdit={onEditCode} />;
  }
  return null;
}

function NoteView({ note, isSelected, onSelect, onChange, onEdit }: { note: Note; isSelected: boolean; onSelect: () => void; onChange: (updates: Partial<Note>) => void; onEdit: (id: string, text: string) => void }) {
  const isDraggingRef = useRef(false);
  const dragCornerRef = useRef<{ corner: 'tl'|'tr'|'bl'|'br'; offset: { dx: number; dy: number } } | null>(null);
  const { colorMode } = useColorMode();
  return (
    <Group
      x={note.x}
      y={note.y}
      draggable
      onDragStart={(e) => {
        isDraggingRef.current = true;
        const stage = e.target.getStage();
        const p = stage?.getPointerPosition();
        if (p) {
          const tl = { x: e.target.x(), y: e.target.y() };
          const tr = { x: e.target.x() + note.width, y: e.target.y() };
          const bl = { x: e.target.x(), y: e.target.y() + note.height };
          const br = { x: e.target.x() + note.width, y: e.target.y() + note.height };
          const corners = [
            { name: 'tl' as const, pt: tl },
            { name: 'tr' as const, pt: tr },
            { name: 'bl' as const, pt: bl },
            { name: 'br' as const, pt: br }
          ];
          corners.sort((a, b) => Math.hypot(p.x - a.pt.x, p.y - a.pt.y) - Math.hypot(p.x - b.pt.x, p.y - b.pt.y));
          const nearest = corners[0];
          dragCornerRef.current = { corner: nearest.name, offset: { dx: p.x - nearest.pt.x, dy: p.y - nearest.pt.y } };
        } else {
          dragCornerRef.current = null;
        }
      }}
      onDragEnd={(e) => {
        isDraggingRef.current = false;
        const stage = e.target.getStage();
        const p = stage?.getPointerPosition();
        let desired = { x: e.target.x(), y: e.target.y() };
        const dc = dragCornerRef.current;
        if (p && dc) {
          const cornerPos = { x: p.x - dc.offset.dx, y: p.y - dc.offset.dy };
          const snappedCorner = snapToGrid(cornerPos.x, cornerPos.y);
          if (dc.corner === 'tl') desired = { x: snappedCorner.x, y: snappedCorner.y };
          if (dc.corner === 'tr') desired = { x: snappedCorner.x - note.width, y: snappedCorner.y };
          if (dc.corner === 'bl') desired = { x: snappedCorner.x, y: snappedCorner.y - note.height };
          if (dc.corner === 'br') desired = { x: snappedCorner.x - note.width, y: snappedCorner.y - note.height };
        }
        const blocks = toBlocks(useWhiteboardStore.getState().elements as Element[], note.id);
        const pos = findNonOverlappingPosition(desired, { width: note.width, height: note.height }, blocks);
        onChange({ x: pos.x, y: pos.y });
      }}
      onDblClick={() => onEdit(note.id, note.text)}
      onMouseDown={onSelect}
    >
      {/* Base sticky note with soft shadow */}
      <Rect
        width={note.width}
        height={note.height}
        fill={note.color}
        stroke={isSelected ? (colorMode === 'light' ? '#3b82f6' : '#60A5FA') : (colorMode === 'light' ? '#e5e7eb' : '#475569')}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={10}
        shadowColor={colorMode === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.45)'}
        shadowBlur={12}
        shadowOffset={{ x: 0, y: 8 }}
        shadowOpacity={0.25}
      />
      {/* Subtle vertical sheen/gradient overlay */}
      <Rect
        width={note.width}
        height={note.height}
        opacity={0.25}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: note.height }}
        fillLinearGradientColorStops={[
          0,
          colorMode === 'light' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
          1,
          colorMode === 'light' ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.20)'
        ]}
        listening={false}
      />
      {/* Small folded corner effect */}
      <Line
        points={[note.width - 18, 0, note.width, 0, note.width, 18]}
        closed
        fill={colorMode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}
        strokeEnabled={false}
        listening={false}
      />
      <Text
        text={note.text}
        x={12}
        y={12}
        fontSize={16}
        width={note.width - 24}
        height={note.height - 24}
        fill={colorMode === 'light' ? '#111827' : '#E5E7EB'}
      />
    </Group>
  );
}

function CodeBlockView({ block, isSelected, onSelect, onChange, onEdit }: { block: CodeBlock; isSelected: boolean; onSelect: () => void; onChange: (updates: Partial<CodeBlock>) => void; onEdit: (id: string, code: string, language: string) => void }) {
  const isDraggingRef = useRef(false);
  const dragCornerRef = useRef<{ corner: 'tl'|'tr'|'bl'|'br'; offset: { dx: number; dy: number } } | null>(null);
  const { colorMode } = useColorMode();
  return (
    <>
      <Group
        x={block.x}
        y={block.y}
        draggable
        onDragStart={(e) => {
          isDraggingRef.current = true;
          const stage = e.target.getStage();
          const p = stage?.getPointerPosition();
          if (p) {
            const tl = { x: e.target.x(), y: e.target.y() };
            const tr = { x: e.target.x() + block.width, y: e.target.y() };
            const bl = { x: e.target.x(), y: e.target.y() + block.height };
            const br = { x: e.target.x() + block.width, y: e.target.y() + block.height };
            const corners = [
              { name: 'tl' as const, pt: tl },
              { name: 'tr' as const, pt: tr },
              { name: 'bl' as const, pt: bl },
              { name: 'br' as const, pt: br }
            ];
            corners.sort((a, b) => Math.hypot(p.x - a.pt.x, p.y - a.pt.y) - Math.hypot(p.x - b.pt.x, p.y - b.pt.y));
            const nearest = corners[0];
            dragCornerRef.current = { corner: nearest.name, offset: { dx: p.x - nearest.pt.x, dy: p.y - nearest.pt.y } };
          } else {
            dragCornerRef.current = null;
          }
        }}
        onDragEnd={(e) => {
          isDraggingRef.current = false;
          const stage = e.target.getStage();
          const p = stage?.getPointerPosition();
          let desired = { x: e.target.x(), y: e.target.y() };
          const dc = dragCornerRef.current;
          if (p && dc) {
            const cornerPos = { x: p.x - dc.offset.dx, y: p.y - dc.offset.dy };
            const snappedCorner = snapToGrid(cornerPos.x, cornerPos.y);
            if (dc.corner === 'tl') desired = { x: snappedCorner.x, y: snappedCorner.y };
            if (dc.corner === 'tr') desired = { x: snappedCorner.x - block.width, y: snappedCorner.y };
            if (dc.corner === 'bl') desired = { x: snappedCorner.x, y: snappedCorner.y - block.height };
            if (dc.corner === 'br') desired = { x: snappedCorner.x - block.width, y: snappedCorner.y - block.height };
          }
          const blocks = toBlocks(useWhiteboardStore.getState().elements as Element[], block.id);
          const pos = findNonOverlappingPosition(desired, { width: block.width, height: block.height }, blocks);
          onChange({ x: pos.x, y: pos.y });
        }}
        onDblClick={() => onEdit(block.id, block.code, block.language)}
        onMouseDown={onSelect}
      >
        <Rect width={block.width} height={block.height} fill={colorMode === 'light' ? '#0F172A' : '#111827'} stroke={isSelected ? '#3b82f6' : (colorMode === 'light' ? '#334155' : '#64748B')} strokeWidth={isSelected ? 3 : 1} cornerRadius={8} />
        <Text text={block.language.toUpperCase()} x={12} y={8} fontSize={12} fill={colorMode === 'light' ? '#93C5FD' : '#BFDBFE'} />
        <Text text={(block.code || '').slice(0, 120)} x={12} y={24} fontSize={12} fill={colorMode === 'light' ? '#E5E7EB' : '#F3F4F6'} width={block.width - 24} height={block.height - 36} />
      </Group>
    </>
  );
}

function ArrowView({ fromId, toId, elements }: { fromId: string; toId: string; elements: Element[] }) {
  const from = elements.find((e) => e.id === fromId) as any;
  const to = elements.find((e) => e.id === toId) as any;
  if (!from || !to || from.type === 'arrow' || to.type === 'arrow') return null;
  const fromCenter = { x: from.x + (from.width || 0) / 2, y: from.y + (from.height || 0) / 2 };
  const toCenter = { x: to.x + (to.width || 0) / 2, y: to.y + (to.height || 0) / 2 };
  return <Arrow points={[fromCenter.x, fromCenter.y, toCenter.x, toCenter.y]} stroke="#334155" fill="#334155" pointerLength={10} pointerWidth={10} />;
}


