"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import Toolbar from "@/components/Toolbar";
import FileGrid from "@/components/FileGrid";
import StatusBar from "@/components/StatusBar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Menu, X, HardDrive } from "lucide-react";
import FileEditor from "@/components/FileEditor";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useKeyboardShortcuts();

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
      {/* Skip to main content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button on mobile */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 md:hidden bg-gray-50 dark:bg-gray-900">
          <span className="text-sm font-semibold">Explorer</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
        <Sidebar />
      </aside>

      {/* Main content */}
      <main id="main-content" className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <HardDrive size={20} className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-base font-semibold tracking-tight">
            File System Builder
          </h1>
        </header>

        <Toolbar />
        <Breadcrumbs />
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr,420px]">
          <FileGrid />
          <FileEditor />
        </div>
        <StatusBar />
      </main>
    </div>
  );
}
