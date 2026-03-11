import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/shared/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScrapMart | AI-Powered Scrap Marketplace",
  description: "Marketplace for manufacturing offsets and raw materials.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 w-full flex flex-col">{children}</main>
        <Toaster position="bottom-right" toastOptions={{ className: 'rounded-2xl shadow-lg border border-gray-100' }} />
      </body>
    </html>
  );
}
