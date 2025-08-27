"use client";
import { Stage, Layer, Rect, Ellipse, Arrow, Text, Group } from "react-konva";
import { useEffect, useRef, useState } from "react";
import { useWhiteboardStore } from "@/store/whiteboardStore";
import type { WhiteboardElement } from "@/types/whiteboard";

export default function WhiteboardCanvas() {
  const board = useWhiteboardStore((s) => s.board);
  const tool = useWhiteboardStore((s) => s.activeTool);
  const addElement = useWhiteboardStore((s) => s.addElement);
  const updateElement = useWhiteboardStore((s) => s.updateElement);
  const selectElement = useWhiteboardStore((s) => s.selectElement);
  const setViewport = useWhiteboardStore((s) => s.setViewport);
  const deleteSelected = useWhiteboardStore((s) => s.deleteSelected);

  const stageRef = useRef<any>(null);
  const setStageRef = useWhiteboardStore((s) => s.setStageRef);
  const [isPanning, setIsPanning] = useState(false);
  const [drawingId, setDrawingId] = useState<string | null>(null);

  useEffect(() => {
    const stage = stageRef.current as any;
    if (!stage || !board) return;
    stage.position({ x: board.viewport.x, y: board.viewport.y });
    stage.scale({ x: board.viewport.scale, y: board.viewport.scale });
    stage.batchDraw();
  }, [board]);

  useEffect(() => {
    setStageRef(stageRef.current);
  }, [setStageRef]);

  if (!board) return null;

  const handleWheel: any = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current as any;
    const oldScale = board.viewport.scale;
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setViewport(newPos.x, newPos.y, newScale);
  };

  const stagePointerPos = () => {
    const stage = stageRef.current as any;
    const pos = stage.getPointerPosition();
    const scale = board.viewport.scale;
    const x = (pos.x - board.viewport.x) / scale;
    const y = (pos.y - board.viewport.y) / scale;
    return { x, y };
  };

  const onMouseDown = (e: any) => {
    if (tool === "pan") {
      setIsPanning(true);
      return;
    }
    if (tool === "select") {
      selectElement(undefined);
      return;
    }
    const { x, y } = stagePointerPos();
    if (tool === "rect") {
      const groupId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const rectId = addElement({ type: "rect", position: { x, y }, width: 1, height: 1, groupId });
      addElement({ type: "text", position: { x, y }, text: "", fontSize: 16, align: "center", groupId });
      setDrawingId(rectId);
    } else if (tool === "ellipse") {
      const groupId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ellId = addElement({ type: "ellipse", position: { x, y }, width: 1, height: 1, groupId });
      addElement({ type: "text", position: { x, y }, text: "", fontSize: 16, align: "center", groupId });
      setDrawingId(ellId);
    } else if (tool === "arrow") {
      const id = addElement({ type: "arrow", position: { x, y }, points: [x, y, x + 1, y + 1] });
      setDrawingId(id);
    } else if (tool === "text") {
      const id = addElement({ type: "text", position: { x, y }, text: "Text" });
      selectElement(id);
    } else if (tool === "code") {
      const id = addElement({ type: "code", position: { x, y }, width: 320, height: 200, code: "", language: "typescript" });
      selectElement(id);
    }
  };

  const onMouseMove = (e: any) => {
    const stage = stageRef.current as any;
    if (isPanning && tool === "pan") {
      const pos = stage.getPointerPosition();
      const dx = e.evt.movementX;
      const dy = e.evt.movementY;
      setViewport(board.viewport.x + dx, board.viewport.y + dy, board.viewport.scale);
      return;
    }
    if (!drawingId) return;
    const { x, y } = stagePointerPos();
    const el = board.elements.find((e) => e.id === drawingId);
    if (!el) return;
    if (el.type === "rect" || el.type === "ellipse") {
      const width = Math.max(1, x - el.position.x);
      const height = Math.max(1, y - el.position.y);
      updateElement(el.id, (prev) => ({ ...prev, width, height }));
      // keep attached text centered within the shape
      const label = board.elements.find((e) => e.groupId === el.groupId && e.type === "text");
      if (label) {
        const cx = el.position.x + width / 2;
        const cy = el.position.y + height / 2;
        updateElement(label.id, (prev: any) => ({ ...prev, position: { x: cx, y: cy } }));
      }
    }
    if (el.type === "arrow") {
      updateElement(el.id, (prev: any) => ({ ...prev, points: [el.position.x, el.position.y, x, y] }));
    }
  };

  const onMouseUp = () => {
    setIsPanning(false);
    setDrawingId(null);
  };

  const onElementClick = (el: WhiteboardElement) => {
    if (tool === "select") selectElement(el.id);
  };

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Delete" || ev.key === "Backspace") {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelected]);

  return (
    <Stage
      ref={stageRef}
      width={typeof window !== "undefined" ? window.innerWidth : 800}
      height={typeof window !== "undefined" ? window.innerHeight - 57 : 600}
      onWheel={handleWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{ background: "#fafafa" }}
    >
      <Layer>
        {board.elements.map((el) => {
          switch (el.type) {
            case "rect":
              return (
                <Group key={el.id} onClick={() => onElementClick(el)}>
                  <Rect
                    x={el.position.x}
                    y={el.position.y}
                    width={el.width || 0}
                    height={el.height || 0}
                    fill="#ffffff"
                    stroke={el.selected ? "#2563eb" : "#111827"}
                    strokeWidth={el.selected ? 2 : 1}
                  />
                  {el.groupId && (
                    board.elements
                      .filter((c) => c.groupId === el.groupId && c.type === "text")
                      .map((label) => (
                        <Text
                          key={label.id}
                          x={(label.position.x || 0) - ((el.width || 0) / 2) + 8}
                          y={(label.position.y || 0) - 8}
                          width={(el.width || 0) - 16}
                          align={(label as any).align || "center"}
                          text={(label as any).text || ""}
                          fontSize={(label as any).fontSize || 16}
                          fill="#111827"
                        />
                      ))
                  )}
                </Group>
              );
            case "ellipse":
              return (
                <Group key={el.id} onClick={() => onElementClick(el)}>
                  <Ellipse
                    x={(el.position.x || 0) + (el.width || 0) / 2}
                    y={(el.position.y || 0) + (el.height || 0) / 2}
                    radiusX={(el.width || 0) / 2}
                    radiusY={(el.height || 0) / 2}
                    fill="#ffffff"
                    stroke={el.selected ? "#2563eb" : "#111827"}
                    strokeWidth={el.selected ? 2 : 1}
                  />
                  {el.groupId && (
                    board.elements
                      .filter((c) => c.groupId === el.groupId && c.type === "text")
                      .map((label) => (
                        <Text
                          key={label.id}
                          x={(label.position.x || 0) - ((el.width || 0) / 2)}
                          y={(label.position.y || 0) - 8}
                          width={(el.width || 0)}
                          align={(label as any).align || "center"}
                          text={(label as any).text || ""}
                          fontSize={(label as any).fontSize || 16}
                          fill="#111827"
                        />
                      ))
                  )}
                </Group>
              );
            case "arrow":
              return (
                <Group key={el.id} onClick={() => onElementClick(el)}>
                  <Arrow
                    points={(el as any).points}
                    stroke={el.selected ? "#2563eb" : "#111827"}
                    strokeWidth={el.selected ? 2 : 1}
                    pointerLength={8}
                    pointerWidth={8}
                  />
                </Group>
              );
            case "text":
              return (
                <Group key={el.id} onClick={() => onElementClick(el)}>
                  <Text
                    x={el.position.x}
                    y={el.position.y}
                    text={(el as any).text}
                    fontSize={(el as any).fontSize || 16}
                    fill="#111827"
                  />
                </Group>
              );
            case "code":
              return (
                <Group key={el.id} onClick={() => onElementClick(el)}>
                  <Rect
                    x={el.position.x}
                    y={el.position.y}
                    width={el.width || 320}
                    height={el.height || 200}
                    fill="#0b1021"
                    cornerRadius={8}
                    stroke={el.selected ? "#2563eb" : "#111827"}
                    strokeWidth={el.selected ? 2 : 1}
                  />
                  <Text
                    x={(el.position.x || 0) + 8}
                    y={(el.position.y || 0) + 8}
                    text={(el as any).language.toUpperCase() + " block"}
                    fontSize={12}
                    fill="#93c5fd"
                  />
                </Group>
              );
            default:
              return null;
          }
        })}
      </Layer>
    </Stage>
  );
}


