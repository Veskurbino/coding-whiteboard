"use client";
import React from "react";
import { CodeEditorModal } from "@/components/CodeEditorModal";
import { useWhiteboardStore } from "@/store/whiteboardStore";

export function CodeBlockOverlay() {
  const board = useWhiteboardStore((s) => s.board);
  const selected = board?.elements.find((e) => e.selected && e.type === "code");
  const open = board?.elements.find((e) => e.open && e.type === "code");
  const update = useWhiteboardStore((s) => s.updateElement);

  const isOpen = Boolean(open);
  const initialCode = (open as any)?.code || "";
  const language = (open as any)?.language || "typescript";

  return (
    <CodeEditorModal
      isOpen={isOpen}
      initialCode={initialCode}
      language={language}
      onClose={() => {
        if (!open) return;
        const opened = useWhiteboardStore.getState().openElement;
        opened(undefined);
      }}
      onSave={(code, lang) => {
        if (!open) return;
        update(open.id, (prev: any) => ({ ...prev, code, language: lang }));
        const opened = useWhiteboardStore.getState().openElement;
        opened(undefined);
      }}
    />
  );
}


