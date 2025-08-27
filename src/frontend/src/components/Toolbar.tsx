"use client";
import { useWhiteboardStore } from "@/store/whiteboardStore";
import type { Tool } from "@/types/whiteboard";
import React from "react";

const TOOLS: { id: Tool; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "pan", label: "Pan" },
  { id: "rect", label: "Note" },
  { id: "ellipse", label: "Ellipse" },
  { id: "arrow", label: "Arrow" },
  { id: "code", label: "Code" },
];

export function Toolbar() {
  const activeTool = useWhiteboardStore((s) => s.activeTool);
  const setActiveTool = useWhiteboardStore((s) => s.setActiveTool);
  const clearBoard = useWhiteboardStore((s) => s.clearBoard);

  return (
    <div className="toolbar">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          className={`btn ${activeTool === tool.id ? "btn-primary" : ""}`}
          onClick={() => setActiveTool(tool.id)}
        >
          {tool.label}
        </button>
      ))}
      <div className="mx-2 w-px h-6 bg-neutral-200" />
      <button className="btn" onClick={() => clearBoard()}>Clear</button>
    </div>
  );
}


