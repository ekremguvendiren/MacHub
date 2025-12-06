import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import WindowFrame from "@/components/Layout/WindowFrame";
import Sidebar from "@/components/Layout/Sidebar";

export const metadata: Metadata = {
  title: "CleanMac UI",
  description: "Modern macOS cleaning application interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WindowFrame>
          <Sidebar />
          <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {children}
          </main>
        </WindowFrame>
      </body>
    </html>
  );
}
