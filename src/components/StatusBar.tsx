"use client";

import { useFileSystem } from "@/context/FileSystemContext";

export default function StatusBar() {
  const { currentChildren, state } = useFileSystem();

  const folderCount = currentChildren.filter((n) => n.type === "folder").length;
  const fileCount = currentChildren.filter((n) => n.type === "file").length;

  const selectedNode = state.selectedNodeId
    ? state.nodes[state.selectedNodeId]
    : null;

  return (
    <footer className="flex items-center justify-between px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0">
      <div className="flex items-center gap-3">
        <span>
          {folderCount} folder{folderCount !== 1 ? "s" : ""}
        </span>
        <span>
          {fileCount} file{fileCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div>
        {selectedNode && (
          <span>
            Selected:{" "}
            <strong className="font-medium text-gray-700 dark:text-gray-300">
              {selectedNode.name}
            </strong>
          </span>
        )}
        {state.clipboardNodeId && state.clipboardAction && (
          <span className="ml-3">
            📋 {state.clipboardAction === "copy" ? "Copied" : "Cut"}:{" "}
            {state.nodes[state.clipboardNodeId]?.name}
          </span>
        )}
      </div>
    </footer>
  );
}
