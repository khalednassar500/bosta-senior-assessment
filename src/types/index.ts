export interface FSNode {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  children?: string[]; // ids of child nodes (only for folders)
  createdAt: number;
  updatedAt: number;
  content?: string; // optional file content
}

export interface FileSystemState {
  nodes: Record<string, FSNode>;
  currentFolderId: string;
  selectedNodeId: string | null;
  clipboardNodeId: string | null;
  clipboardAction: "copy" | "cut" | null;
}

export type FSAction =
  | {
      type: "CREATE_NODE";
      payload: { parentId: string; name: string; nodeType: "file" | "folder" };
    }
  | { type: "DELETE_NODE"; payload: { id: string } }
  | { type: "RENAME_NODE"; payload: { id: string; newName: string } }
  | { type: "UPDATE_FILE_CONTENT"; payload: { id: string; content: string } }
  | { type: "NAVIGATE"; payload: { folderId: string } }
  | { type: "SELECT_NODE"; payload: { id: string | null } }
  | { type: "COPY_NODE"; payload: { id: string } }
  | { type: "CUT_NODE"; payload: { id: string } }
  | { type: "PASTE_NODE"; payload: { targetFolderId: string } }
  | { type: "LOAD_STATE"; payload: FileSystemState };
