import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Manager",
  description: "A task management app built with Next.js, Tailwind, and Appwrite",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
      { 
        rel: "android-chrome-192x192", 
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      { 
        rel: "android-chrome-512x512", 
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="pt-20 relative overflow-hidden">
            <div className="bg-blob bg-blob-1"></div>
            <div className="bg-blob bg-blob-2"></div>
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
