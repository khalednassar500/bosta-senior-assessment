import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FileSystemProvider } from "@/context/FileSystemContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "File System Builder",
  description:
    "A browser-based file system manager built with React and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <FileSystemProvider>{children}</FileSystemProvider>
      </body>
    </html>
  );
}
