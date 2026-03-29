"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { FSNode, FSAction, FileSystemState } from "@/types";

const ROOT_ID = "root";

function createDefaultState(): FileSystemState {
  const now = Date.now();
  const documentsId = uuidv4();
  const photosId = uuidv4();
  const readmeId = uuidv4();
  const notesId = uuidv4();

  return {
    nodes: {
      [ROOT_ID]: {
        id: ROOT_ID,
        name: "Root",
        type: "folder",
        parentId: null,
        children: [documentsId, photosId, readmeId],
        createdAt: now,
        updatedAt: now,
      },
      [documentsId]: {
        id: documentsId,
        name: "Documents",
        type: "folder",
        parentId: ROOT_ID,
        children: [notesId],
        createdAt: now,
        updatedAt: now,
      },
      [photosId]: {
        id: photosId,
        name: "Photos",
        type: "folder",
        parentId: ROOT_ID,
        children: [],
        createdAt: now,
        updatedAt: now,
      },
      [readmeId]: {
        id: readmeId,
        name: "README.md",
        type: "file",
        parentId: ROOT_ID,
        content: "# Welcome to the File System Builder\n\nThis is a demo file.",
        createdAt: now,
        updatedAt: now,
      },
      [notesId]: {
        id: notesId,
        name: "notes.txt",
        type: "file",
        parentId: documentsId,
        content: "These are some notes.",
        createdAt: now,
        updatedAt: now,
      },
    },
    currentFolderId: ROOT_ID,
    selectedNodeId: null,
    clipboardNodeId: null,
    clipboardAction: null,
  };
}

// Recursively collect all descendant IDs of a folder
function collectDescendants(
  nodes: Record<string, FSNode>,
  id: string
): string[] {
  const node = nodes[id];
  if (!node || node.type !== "folder" || !node.children) return [];
  const ids: string[] = [];
  for (const childId of node.children) {
    ids.push(childId);
    ids.push(...collectDescendants(nodes, childId));
  }
  return ids;
}

// Deep clone a subtree, assigning new IDs
function cloneSubtree(
  nodes: Record<string, FSNode>,
  nodeId: string,
  newParentId: string
): Record<string, FSNode> {
  const orig = nodes[nodeId];
  if (!orig) return {};

  const newId = uuidv4();
  const now = Date.now();
  const cloned: Record<string, FSNode> = {};

  if (orig.type === "file") {
    cloned[newId] = {
      ...orig,
      id: newId,
      parentId: newParentId,
      createdAt: now,
      updatedAt: now,
    };
  } else {
    const newChildren: string[] = [];
    for (const childId of orig.children || []) {
      const childClones = cloneSubtree(nodes, childId, newId);
      Object.assign(cloned, childClones);
      newChildren.push(
        Object.keys(childClones).find((k) => childClones[k].parentId === newId)!
      );
    }
    cloned[newId] = {
      ...orig,
      id: newId,
      parentId: newParentId,
      children: newChildren,
      createdAt: now,
      updatedAt: now,
    };
  }

  return cloned;
}

function fsReducer(state: FileSystemState, action: FSAction): FileSystemState {
  const now = Date.now();

  switch (action.type) {
    case "CREATE_NODE": {
      const { parentId, name, nodeType } = action.payload;
      const parent = state.nodes[parentId];
      if (!parent || parent.type !== "folder") return state;

      // Prevent duplicate names in the same folder
      const siblings = parent.children || [];
      const duplicate = siblings.some((cid) => state.nodes[cid]?.name === name);
      if (duplicate) return state;

      const newId = uuidv4();
      const newNode: FSNode = {
        id: newId,
        name,
        type: nodeType,
        parentId,
        ...(nodeType === "folder" ? { children: [] } : { content: "" }),
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [newId]: newNode,
          [parentId]: {
            ...parent,
            children: [...siblings, newId],
            updatedAt: now,
          },
        },
      };
    }

    case "DELETE_NODE": {
      const { id } = action.payload;
      if (id === ROOT_ID) return state;
      const node = state.nodes[id];
      if (!node) return state;

      const idsToDelete = [id, ...collectDescendants(state.nodes, id)];
      const newNodes = { ...state.nodes };
      for (const did of idsToDelete) {
        delete newNodes[did];
      }

      // Remove from parent's children
      if (node.parentId && newNodes[node.parentId]) {
        const parent = newNodes[node.parentId];
        newNodes[node.parentId] = {
          ...parent,
          children: (parent.children || []).filter((cid) => cid !== id),
          updatedAt: now,
        };
      }

      // If the deleted folder was the current folder, navigate up
      let newCurrentFolder = state.currentFolderId;
      if (idsToDelete.includes(state.currentFolderId)) {
        newCurrentFolder = node.parentId || ROOT_ID;
      }

      return {
        ...state,
        nodes: newNodes,
        currentFolderId: newCurrentFolder,
        selectedNodeId:
          state.selectedNodeId && idsToDelete.includes(state.selectedNodeId)
            ? null
            : state.selectedNodeId,
      };
    }

    case "RENAME_NODE": {
      const { id, newName } = action.payload;
      if (id === ROOT_ID) return state;
      const node = state.nodes[id];
      if (!node) return state;

      // Prevent duplicate names in the same folder
      if (node.parentId) {
        const parent = state.nodes[node.parentId];
        const siblings = (parent?.children || []).filter((cid) => cid !== id);
        const duplicate = siblings.some(
          (cid) => state.nodes[cid]?.name === newName
        );
        if (duplicate) return state;
      }

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [id]: { ...node, name: newName, updatedAt: now },
        },
      };
    }

    case "UPDATE_FILE_CONTENT": {
      const { id, content } = action.payload;
      const node = state.nodes[id];
      if (!node || node.type !== "file") return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [id]: { ...node, content, updatedAt: now },
        },
      };
    }

    case "NAVIGATE": {
      const { folderId } = action.payload;
      const folder = state.nodes[folderId];
      if (!folder || folder.type !== "folder") return state;
      return { ...state, currentFolderId: folderId, selectedNodeId: null };
    }

    case "SELECT_NODE": {
      return { ...state, selectedNodeId: action.payload.id };
    }

    case "COPY_NODE": {
      return {
        ...state,
        clipboardNodeId: action.payload.id,
        clipboardAction: "copy",
      };
    }

    case "CUT_NODE": {
      return {
        ...state,
        clipboardNodeId: action.payload.id,
        clipboardAction: "cut",
      };
    }

    case "PASTE_NODE": {
      const { targetFolderId } = action.payload;
      const { clipboardNodeId, clipboardAction } = state;
      if (!clipboardNodeId || !clipboardAction) return state;

      const target = state.nodes[targetFolderId];
      if (!target || target.type !== "folder") return state;

      const sourceNode = state.nodes[clipboardNodeId];
      if (!sourceNode) return state;

      // Prevent pasting a folder into itself or its descendants
      if (sourceNode.type === "folder") {
        const descendants = collectDescendants(state.nodes, clipboardNodeId);
        if (
          targetFolderId === clipboardNodeId ||
          descendants.includes(targetFolderId)
        )
          return state;
      }

      if (clipboardAction === "copy") {
        const clones = cloneSubtree(
          state.nodes,
          clipboardNodeId,
          targetFolderId
        );
        const topCloneId = Object.keys(clones).find(
          (k) => clones[k].parentId === targetFolderId
        )!;
        const newNodes = {
          ...state.nodes,
          ...clones,
          [targetFolderId]: {
            ...target,
            children: [...(target.children || []), topCloneId],
            updatedAt: now,
          },
        };
        return { ...state, nodes: newNodes };
      }

      // Cut = move
      const newNodes = { ...state.nodes };

      // Remove from old parent
      if (sourceNode.parentId && newNodes[sourceNode.parentId]) {
        const oldParent = newNodes[sourceNode.parentId];
        newNodes[sourceNode.parentId] = {
          ...oldParent,
          children: (oldParent.children || []).filter(
            (cid) => cid !== clipboardNodeId
          ),
          updatedAt: now,
        };
      }

      // Add to new parent
      newNodes[targetFolderId] = {
        ...target,
        children: [...(target.children || []), clipboardNodeId],
        updatedAt: now,
      };

      // Update node's parentId
      newNodes[clipboardNodeId] = {
        ...sourceNode,
        parentId: targetFolderId,
        updatedAt: now,
      };

      return {
        ...state,
        nodes: newNodes,
        clipboardNodeId: null,
        clipboardAction: null,
      };
    }

    case "LOAD_STATE": {
      return action.payload;
    }

    default:
      return state;
  }
}

interface FSContextType {
  state: FileSystemState;
  dispatch: React.Dispatch<FSAction>;
  currentFolder: FSNode;
  currentChildren: FSNode[];
  breadcrumbs: FSNode[];
  createNode: (name: string, nodeType: "file" | "folder") => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
  navigateTo: (folderId: string) => void;
  selectNode: (id: string | null) => void;
  copyNode: (id: string) => void;
  cutNode: (id: string) => void;
  pasteNode: () => void;
}

const FSContext = createContext<FSContextType | null>(null);

export function FileSystemProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(fsReducer, null, () =>
    createDefaultState()
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fs-state");
      if (saved) {
        const parsed = JSON.parse(saved) as FileSystemState;
        // Basic validation
        if (parsed.nodes && parsed.nodes[ROOT_ID]) {
          dispatch({ type: "LOAD_STATE", payload: parsed });
        }
      }
    } catch {
      // ignore – use default state
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem("fs-state", JSON.stringify(state));
    } catch {
      // storage full, etc.
    }
  }, [state]);

  const currentFolder =
    state.nodes[state.currentFolderId] || state.nodes[ROOT_ID];

  const currentChildren = useMemo(() => {
    const ids = currentFolder.children || [];
    return ids
      .map((id) => state.nodes[id])
      .filter(Boolean)
      .sort((a, b) => {
        // folders first, then alphabetical
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [currentFolder.children, state.nodes]);

  const breadcrumbs = useMemo(() => {
    const crumbs: FSNode[] = [];
    let current: FSNode | undefined = currentFolder;
    while (current) {
      crumbs.unshift(current);
      current = current.parentId ? state.nodes[current.parentId] : undefined;
    }
    return crumbs;
  }, [currentFolder, state.nodes]);

  const createNode = useCallback(
    (name: string, nodeType: "file" | "folder") => {
      dispatch({
        type: "CREATE_NODE",
        payload: { parentId: state.currentFolderId, name, nodeType },
      });
    },
    [state.currentFolderId]
  );

  const deleteNode = useCallback((id: string) => {
    dispatch({ type: "DELETE_NODE", payload: { id } });
  }, []);

  const renameNode = useCallback((id: string, newName: string) => {
    dispatch({ type: "RENAME_NODE", payload: { id, newName } });
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    dispatch({ type: "UPDATE_FILE_CONTENT", payload: { id, content } });
  }, []);

  const navigateTo = useCallback((folderId: string) => {
    dispatch({ type: "NAVIGATE", payload: { folderId } });
  }, []);

  const selectNode = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_NODE", payload: { id } });
  }, []);

  const copyNode = useCallback((id: string) => {
    dispatch({ type: "COPY_NODE", payload: { id } });
  }, []);

  const cutNode = useCallback((id: string) => {
    dispatch({ type: "CUT_NODE", payload: { id } });
  }, []);

  const pasteNode = useCallback(() => {
    dispatch({
      type: "PASTE_NODE",
      payload: { targetFolderId: state.currentFolderId },
    });
  }, [state.currentFolderId]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      currentFolder,
      currentChildren,
      breadcrumbs,
      createNode,
      deleteNode,
      renameNode,
      updateFileContent,
      navigateTo,
      selectNode,
      copyNode,
      cutNode,
      pasteNode,
    }),
    [
      state,
      currentFolder,
      currentChildren,
      breadcrumbs,
      createNode,
      deleteNode,
      renameNode,
      updateFileContent,
      navigateTo,
      selectNode,
      copyNode,
      cutNode,
      pasteNode,
    ]
  );

  return <FSContext.Provider value={value}>{children}</FSContext.Provider>;
}

export function useFileSystem() {
  const ctx = useContext(FSContext);
  if (!ctx)
    throw new Error("useFileSystem must be used within FileSystemProvider");
  return ctx;
}
