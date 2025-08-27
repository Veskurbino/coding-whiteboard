"use client";
import dynamic from "next/dynamic";
import React from "react";
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Props = {
  isOpen: boolean;
  initialCode: string;
  language: string;
  onClose: () => void;
  onSave: (code: string, language: string) => void;
};

export function CodeEditorModal({ isOpen, initialCode, language, onClose, onSave }: Props) {
  const [code, setCode] = React.useState(initialCode);
  const [lang, setLang] = React.useState(language);
  React.useEffect(() => {
    setCode(initialCode);
    setLang(language);
  }, [initialCode, language]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[900px] max-w-[95vw] h-[600px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Edit Code</span>
            <select className="border rounded px-2 py-1 text-sm" value={lang} onChange={(e) => setLang(e.target.value)}>
              {[
                "typescript",
                "javascript",
                "python",
                "java",
                "c",
                "cpp",
                "go",
                "rust",
                "sql",
                "markdown",
              ].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(code, lang)}>Save</button>
          </div>
        </div>
        <div className="flex-1">
          <MonacoEditor
            height="100%"
            language={lang}
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
        </div>
      </div>
    </div>
  );
}


