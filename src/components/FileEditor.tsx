"use client";

import { useFileSystem } from "@/context/FileSystemContext";
import { useState, useMemo } from "react";
import { FileText, Save, X } from "lucide-react";

/**
 * Inner editor component that resets its local state
 * whenever 'key' changes (i.e. a different file is selected).
 */
function EditorPane({ fileId }: { fileId: string }) {
  const { state, updateFileContent, selectNode } = useFileSystem();
  const node = state.nodes[fileId];

  const [text, setText] = useState(node?.content || "");
  const [dirty, setDirty] = useState(false);

  if (!node || node.type !== "file") return null;

  const handleSave = () => {
    updateFileContent(node.id, text);
    setDirty(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setDirty(true);
  };

  return (
    <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="shrink-0 text-blue-400" />
          <span className="text-sm font-medium truncate">{node.name}</span>
          {dirty && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-orange-400" title="Unsaved changes" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="toolbar-btn"
            aria-label="Save file"
            title="Save (writes to browser storage)"
          >
            <Save size={14} />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={() => selectNode(null)}
            className="toolbar-btn"
            aria-label="Close editor"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 p-0 overflow-auto">
        <textarea
          value={text}
          onChange={handleChange}
          spellCheck={false}
          className="w-full h-full min-h-[280px] p-4 bg-white dark:bg-gray-900 text-sm font-mono leading-relaxed resize-none focus:outline-none"
          aria-label={`Editing ${node.name}`}
        />
      </div>
    </div>
  );
}

export default function FileEditor() {
  const { state } = useFileSystem();
  const selectedId = state.selectedNodeId;

  // Determine if the selected node is a file we can edit
  const fileId = useMemo(() => {
    if (!selectedId) return null;
    const n = state.nodes[selectedId];
    if (!n || n.type !== "file") return null;
    return n.id;
  }, [selectedId, state.nodes]);

  if (!fileId) return null;

  // Using key={fileId} forces React to remount EditorPane
  // whenever a different file is selected — this resets local
  // state (text, dirty) without needing useEffect + setState.
  return <EditorPane key={fileId} fileId={fileId} />;
}
