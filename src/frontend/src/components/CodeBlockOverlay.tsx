"use client";
import React from "react";
import { CodeEditorModal } from "@/components/CodeEditorModal";
import { useWhiteboardStore } from "@/store/whiteboardStore";

export function CodeBlockOverlay() {
  const board = useWhiteboardStore((s) => s.board);
  const selected = board?.elements.find((e) => e.selected && e.type === "code");
  const update = useWhiteboardStore((s) => s.updateElement);

  const isOpen = Boolean(selected);
  const initialCode = (selected as any)?.code || "";
  const language = (selected as any)?.language || "typescript";

  return (
    <CodeEditorModal
      isOpen={isOpen}
      initialCode={initialCode}
      language={language}
      onClose={() => {
        if (!selected) return;
        // Deselect by toggling selected to false
        const id = selected.id;
        const deselect = useWhiteboardStore.getState().selectElement;
        deselect(undefined);
      }}
      onSave={(code, lang) => {
        if (!selected) return;
        update(selected.id, (prev: any) => ({ ...prev, code, language: lang }));
      }}
    />
  );
}


