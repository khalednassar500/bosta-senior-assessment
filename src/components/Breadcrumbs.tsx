"use client";

import { useFileSystem } from "@/context/FileSystemContext";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const { breadcrumbs, navigateTo } = useFileSystem();

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"
    >
      {breadcrumbs.map((crumb, idx) => (
        <span key={crumb.id} className="flex items-center gap-1 shrink-0">
          {idx > 0 && <ChevronRight size={14} className="text-gray-400" />}
          <button
            onClick={() => navigateTo(crumb.id)}
            className={`
              px-1.5 py-0.5 rounded transition-colors
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${
                idx === breadcrumbs.length - 1
                  ? "font-medium text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }
            `}
            aria-current={idx === breadcrumbs.length - 1 ? "page" : undefined}
          >
            {crumb.parentId === null ? <Home size={14} /> : crumb.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
