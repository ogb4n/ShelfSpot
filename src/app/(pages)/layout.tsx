import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/app/components/shared/Navbar";
import React from "react";
import { AuthProvider } from "../contexts/authContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "ShelfSpot",
  description: "Keep an eye on your stocks",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0, overflow: "hidden" }}
      >
        <div style={{ display: "flex", height: "100vh" }}>
          <header style={{ flexShrink: 0 }}>
            <Navbar />
          </header>
          <AuthProvider>
            <div style={{ flexGrow: 1, overflow: "auto" }}>{children}</div>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
