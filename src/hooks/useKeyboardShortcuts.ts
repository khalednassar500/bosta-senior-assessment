"use client";

import { useEffect } from "react";
import { useFileSystem } from "@/context/FileSystemContext";

export function useKeyboardShortcuts() {
  const { state, deleteNode, copyNode, cutNode, pasteNode } = useFileSystem();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't intercept when typing in inputs
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMeta = e.metaKey || e.ctrlKey;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedNodeId) {
          e.preventDefault();
          const node = state.nodes[state.selectedNodeId];
          const label = node ? `"${node.name}"` : "this item";
          if (window.confirm(`Are you sure you want to delete ${label}?`)) {
            deleteNode(state.selectedNodeId);
          }
        }
      }

      if (isMeta && e.key === "c") {
        if (state.selectedNodeId) {
          e.preventDefault();
          copyNode(state.selectedNodeId);
        }
      }

      if (isMeta && e.key === "x") {
        if (state.selectedNodeId) {
          e.preventDefault();
          cutNode(state.selectedNodeId);
        }
      }

      if (isMeta && e.key === "v") {
        if (state.clipboardNodeId) {
          e.preventDefault();
          pasteNode();
        }
      }

      if (e.key === "F2") {
        if (state.selectedNodeId) {
          e.preventDefault();
          window.dispatchEvent(
            new CustomEvent("fs-rename", { detail: state.selectedNodeId })
          );
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    state.selectedNodeId,
    state.clipboardNodeId,
    state.nodes,
    deleteNode,
    copyNode,
    cutNode,
    pasteNode,
  ]);
}
