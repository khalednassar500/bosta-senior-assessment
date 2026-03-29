"use client";

import { useFileSystem } from "@/context/FileSystemContext";
import {
  FolderPlus,
  FilePlus,
  Trash2,
  Pencil,
  Copy,
  Scissors,
  Clipboard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ConfirmDialog from "./ConfirmDialog";

export default function Toolbar() {
  const { state, createNode, deleteNode, copyNode, cutNode, pasteNode } =
    useFileSystem();

  const [creatingType, setCreatingType] = useState<"file" | "folder" | null>(
    null
  );
  const [newName, setNewName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creatingType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creatingType]);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (trimmed && creatingType) {
      createNode(trimmed, creatingType);
    }
    setNewName("");
    setCreatingType(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") {
      setNewName("");
      setCreatingType(null);
    }
  };

  const hasSelection = !!state.selectedNodeId;
  const hasClipboard = !!state.clipboardNodeId;

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-wrap">
      {/* Create buttons */}
      <button
        onClick={() => setCreatingType("folder")}
        className="toolbar-btn"
        title="New Folder"
        aria-label="New Folder"
      >
        <FolderPlus size={16} />
        <span className="hidden sm:inline">New Folder</span>
      </button>
      <button
        onClick={() => setCreatingType("file")}
        className="toolbar-btn"
        title="New File"
        aria-label="New File"
      >
        <FilePlus size={16} />
        <span className="hidden sm:inline">New File</span>
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Actions on selected item */}
      <button
        onClick={() => {
          if (state.selectedNodeId) {
            // We'll dispatch a custom event that FileItem listens for
            window.dispatchEvent(
              new CustomEvent("fs-rename", { detail: state.selectedNodeId })
            );
          }
        }}
        disabled={!hasSelection}
        className="toolbar-btn"
        title="Rename"
        aria-label="Rename"
      >
        <Pencil size={16} />
        <span className="hidden sm:inline">Rename</span>
      </button>
      <button
        onClick={() => state.selectedNodeId && setShowDeleteConfirm(true)}
        disabled={!hasSelection}
        className="toolbar-btn"
        title="Delete"
        aria-label="Delete"
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">Delete</span>
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Clipboard */}
      <button
        onClick={() => state.selectedNodeId && copyNode(state.selectedNodeId)}
        disabled={!hasSelection}
        className="toolbar-btn"
        title="Copy"
        aria-label="Copy"
      >
        <Copy size={16} />
      </button>
      <button
        onClick={() => state.selectedNodeId && cutNode(state.selectedNodeId)}
        disabled={!hasSelection}
        className="toolbar-btn"
        title="Cut"
        aria-label="Cut"
      >
        <Scissors size={16} />
      </button>
      <button
        onClick={pasteNode}
        disabled={!hasClipboard}
        className="toolbar-btn"
        title="Paste"
        aria-label="Paste"
      >
        <Clipboard size={16} />
        <span className="hidden sm:inline">Paste</span>
      </button>

      {/* Inline creation input */}
      {creatingType && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-500">New {creatingType}:</span>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleCreate}
            placeholder={
              creatingType === "folder" ? "folder name" : "filename.ext"
            }
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            aria-label={`Name for new ${creatingType}`}
          />
        </div>
      )}

      {/* Delete confirmation dialog */}
      {state.selectedNodeId && (
        <ConfirmDialog
          open={showDeleteConfirm}
          title={`Delete ${state.nodes[state.selectedNodeId]?.type === "folder" ? "folder" : "file"}`}
          message={`Are you sure you want to delete "${state.nodes[state.selectedNodeId]?.name}"?${
            state.nodes[state.selectedNodeId]?.type === "folder"
              ? " All contents will be permanently removed."
              : ""
          }`}
          confirmLabel="Delete"
          onConfirm={() => {
            deleteNode(state.selectedNodeId!);
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
