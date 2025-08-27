import React from "react";
import { ExportButtons } from "@/components/ExportButtons";

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full">
      <div className="absolute right-4 top-4 z-10">
        <ExportButtons />
      </div>
      {children}
    </div>
  );
}


