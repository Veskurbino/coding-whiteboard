"use client";
import React from "react";
import { useWhiteboardStore } from "@/store/whiteboardStore";

export function ExportButtons() {
  const board = useWhiteboardStore((s) => s.board);

  const exportJSON = () => {
    if (!board) return;
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${board.title || "board"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStageDataURL = useWhiteboardStore((s) => s.getStageDataURL);
  const exportPNG = () => {
    const url = getStageDataURL();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${board?.title || "board"}.png`;
    a.click();
  };

  return (
    <div className="flex items-center gap-2">
      <button className="btn" onClick={exportJSON}>Export JSON</button>
      <button className="btn" onClick={exportPNG}>Export PNG</button>
    </div>
  );
}


