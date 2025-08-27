"use client";
import dynamic from "next/dynamic";
import { Toolbar } from "@/components/Toolbar";
import { useEffect } from "react";
import { useAutosave } from "@/lib/useAutosave";
import { useWhiteboardStore } from "@/store/whiteboardStore";
import { CodeBlockOverlay } from "@/components/CodeBlockOverlay";
import { useParams } from "next/navigation";

const WhiteboardCanvas = dynamic(() => import("@/components/WhiteboardCanvas"), {
  ssr: false,
});

export default function BoardPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "local-mvp";
  const { startNewBoard } = useWhiteboardStore();
  useEffect(() => {
    startNewBoard(String(id));
  }, [id, startNewBoard]);

  useAutosave(String(id));

  return (
    <div className="h-[calc(100vh-57px)] w-full relative">
      <div className="absolute left-4 top-4 z-10"><Toolbar /></div>
      <CodeBlockOverlay />
      <WhiteboardCanvas />
    </div>
  );
}


