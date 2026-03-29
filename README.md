# React File System Builder

A browser-based file system application built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**. Users can manage files and directories within an intuitive, responsive UI — no server required.

<img width="881" height="350" alt="Screenshot 2026-03-29 at 1 39 58 PM" src="https://github.com/user-attachments/assets/670e7314-fb09-43cc-8bf7-6408b7e7f3b7" />

**Live demo →** [https://bosta-senior-assessment.vercel.app/](https://bosta-senior-assessment.vercel.app/)

## Features

### File Navigation
- **Sidebar Tree View** — Hierarchical folder navigation with expand/collapse
- **Breadcrumb Trail** — Click any ancestor folder to jump back
- **Double-click** folders in the grid to navigate into them

### File Management
- **Create** files and folders via the toolbar
- **Rename** via context menu, toolbar, or F2 keyboard shortcut
- **Delete** with confirmation dialog to prevent accidental loss
- **Copy / Cut / Paste** — supports deep folder cloning
- **Inline File Editor** — select a file to view/edit its content in a side panel

### Responsive Design
- Collapsible sidebar that slides in on mobile via hamburger menu
- Adaptive file grid (2–7 columns depending on viewport)
- Toolbar labels hide on small screens, keeping icons visible

### Performance
- `React.memo` on FileItem to skip unnecessary re-renders
- `useMemo` / `useCallback` throughout the Context provider
- Reducer-based state management (predictable, single source of truth)

### Accessibility
- Skip-to-content link for keyboard users
- ARIA tree / treeitem roles on the sidebar
- `aria-label`, `aria-pressed`, `aria-current` on interactive elements
- Native `<dialog>` element for delete confirmations
- Visible focus rings via `focus-visible`
- Keyboard shortcuts: Ctrl/Cmd + C/X/V, Delete, F2

### Persistence
- Full file system state is saved to `localStorage` and restored on page load

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | React Context API + useReducer |
| Icons | lucide-react |
| IDs | uuid |

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind imports + utility styles
│   ├── layout.tsx           # Root layout with FileSystemProvider
│   └── page.tsx             # Main page composing all components
├── components/
│   ├── Breadcrumbs.tsx      # Path breadcrumb navigation
│   ├── ConfirmDialog.tsx    # Reusable native dialog confirmation
│   ├── FileEditor.tsx       # Side panel file content editor
│   ├── FileGrid.tsx         # Responsive grid of files/folders
│   ├── FileItem.tsx         # Individual file/folder card + context menu
│   ├── Sidebar.tsx          # Folder tree navigation
│   ├── StatusBar.tsx        # Bottom bar with counts + clipboard info
│   └── Toolbar.tsx          # Action buttons + inline create input
├── context/
│   └── FileSystemContext.tsx # Global state: reducer, provider, hooks
├── hooks/
│   └── useKeyboardShortcuts.ts  # Global keyboard shortcut handler
└── types/
    └── index.ts             # FSNode, FileSystemState, FSAction types
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
