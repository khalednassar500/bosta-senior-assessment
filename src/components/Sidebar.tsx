"use client";

import { useFileSystem } from "@/context/FileSystemContext";
import { FSNode } from "@/types";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { useState, useCallback } from "react";

function TreeNode({ node, depth }: { node: FSNode; depth: number }) {
  const { state, navigateTo } = useFileSystem();
  const [expanded, setExpanded] = useState(depth < 1);

  const isActive = state.currentFolderId === node.id;
  const children = (node.children || [])
    .map((id) => state.nodes[id])
    .filter((n) => n && n.type === "folder")
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(() => {
    navigateTo(node.id);
    setExpanded(true);
  }, [navigateTo, node.id]);

  return (
    <div role="treeitem" aria-expanded={expanded} aria-selected={isActive}>
      <button
        onClick={handleNavigate}
        className={`
          flex items-center w-full gap-1 px-2 py-1.5 text-sm rounded-md transition-colors
          hover:bg-gray-100 dark:hover:bg-gray-800
          ${
            isActive
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
              : "text-gray-700 dark:text-gray-300"
          }
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        aria-current={isActive ? "page" : undefined}
        title={node.name}
      >
        {children.length > 0 ? (
          <span
            onClick={handleToggle}
            className="shrink-0 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            role="button"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-[18px] shrink-0" />
        )}
        {expanded && isActive ? (
          <FolderOpen size={16} className="shrink-0 text-blue-500" />
        ) : (
          <Folder size={16} className="shrink-0 text-yellow-500" />
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {expanded && children.length > 0 && (
        <div role="group">
          {children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { state } = useFileSystem();
  const root = state.nodes["root"];

  if (!root) return null;

  return (
    <nav
      aria-label="File tree"
      className="w-64 h-full shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto"
    >        <div className="p-3" role="tree" aria-label="Folder tree">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-2">
          Explorer
        </h2>
        <TreeNode node={root} depth={0} />
      </div>
    </nav>
  );
}
