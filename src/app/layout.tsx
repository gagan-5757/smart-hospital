import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import NotificationCenter from "@/components/NotificationCenter";

export const metadata: Metadata = {
  title: "NexusCare",
  description:
    "Smart Hospital Resource Coordination Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <NotificationCenter />

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}