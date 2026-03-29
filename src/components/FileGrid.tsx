"use client";

import { useFileSystem } from "@/context/FileSystemContext";
import FileItem from "./FileItem";
import { FolderOpen } from "lucide-react";

export default function FileGrid() {
  const { currentChildren, selectNode } = useFileSystem();

  return (
    <div
      className="flex-1 overflow-y-auto p-4"
      onClick={() => selectNode(null)}
    >
      {currentChildren.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-3">
          <FolderOpen size={48} strokeWidth={1.5} />
          <p className="text-sm">This folder is empty</p>
          <p className="text-xs text-gray-400">
            Use the toolbar to create files or folders
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-2">
          {currentChildren.map((node) => (
            <FileItem key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
