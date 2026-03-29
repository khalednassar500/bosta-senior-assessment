"use client";

import { useFileSystem } from "@/context/FileSystemContext";
import { FSNode } from "@/types";
import {
  Folder,
  File,
  FileText,
  FileImage,
  FileCode,
  FileJson,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Scissors,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import ConfirmDialog from "./ConfirmDialog";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "txt":
    case "md":
    case "doc":
    case "pdf":
      return <FileText size={32} className="text-blue-400" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return <FileImage size={32} className="text-green-400" />;
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "py":
    case "java":
    case "cpp":
    case "c":
    case "html":
    case "css":
      return <FileCode size={32} className="text-orange-400" />;
    case "json":
      return <FileJson size={32} className="text-yellow-400" />;
    default:
      return <File size={32} className="text-gray-400" />;
  }
}

function FileItem({ node }: { node: FSNode }) {
  const {
    state,
    navigateTo,
    selectNode,
    renameNode,
    deleteNode,
    copyNode,
    cutNode,
  } = useFileSystem();
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSelected = state.selectedNodeId === node.id;
  const isCut =
    state.clipboardNodeId === node.id && state.clipboardAction === "cut";

  // Listen for rename events from Toolbar
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail === node.id) {
        setIsRenaming(true);
        setEditName(node.name);
      }
    };
    window.addEventListener("fs-rename", handler);
    return () => window.removeEventListener("fs-rename", handler);
  }, [node.id, node.name]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      // Select the name without extension for files
      if (node.type === "file") {
        const dotIdx = node.name.lastIndexOf(".");
        if (dotIdx > 0) {
          inputRef.current.setSelectionRange(0, dotIdx);
        } else {
          inputRef.current.select();
        }
      } else {
        inputRef.current.select();
      }
    }
  }, [isRenaming, node.type, node.name]);

  // Close context menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== node.name) {
      renameNode(node.id, trimmed);
    }
    setIsRenaming(false);
  }, [editName, node.id, node.name, renameNode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") setIsRenaming(false);
  };

  const handleDoubleClick = () => {
    if (node.type === "folder") {
      navigateTo(node.id);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`
        relative group flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        transition-all duration-150 select-none
        ${
          isSelected
            ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        ${isCut ? "opacity-50" : ""}
      `}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${node.type === "folder" ? "Folder" : "File"}: ${node.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" && node.type === "folder") navigateTo(node.id);
      }}
    >
      {/* Context menu button */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="More actions"
        >
          <MoreVertical size={14} />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 top-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-[140px]"
            role="menu"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setEditName(node.name);
                setShowMenu(false);
              }}
              className="context-menu-item"
              role="menuitem"
            >
              <Pencil size={14} /> Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyNode(node.id);
                setShowMenu(false);
              }}
              className="context-menu-item"
              role="menuitem"
            >
              <Copy size={14} /> Copy
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cutNode(node.id);
                setShowMenu(false);
              }}
              className="context-menu-item"
              role="menuitem"
            >
              <Scissors size={14} /> Cut
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                setShowDeleteConfirm(true);
              }}
              className="context-menu-item text-red-600 dark:text-red-400"
              role="menuitem"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="mb-1">
        {node.type === "folder" ? (
          <Folder size={32} className="text-yellow-500" />
        ) : (
          getFileIcon(node.name)
        )}
      </div>

      {/* Name */}
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleRenameSubmit}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-center w-full px-1 py-0.5 border border-blue-400 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Rename"
        />
      ) : (
        <span
          className="text-xs text-center break-all line-clamp-2 leading-tight max-w-[90px]"
          title={node.name}
        >
          {node.name}
        </span>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title={`Delete ${node.type === "folder" ? "folder" : "file"}`}
        message={`Are you sure you want to delete "${node.name}"?${node.type === "folder" ? " All contents will be permanently removed." : ""}`}
        confirmLabel="Delete"
        onConfirm={() => {
          deleteNode(node.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

export default memo(FileItem);
