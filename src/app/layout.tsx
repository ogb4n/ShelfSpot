import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { Providers } from "./contexts/ContextsProviders";
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
  description: "Keep an eye on your business",
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
          <header style={{ flexShrink: 0 }}></header>
          <div style={{ flexGrow: 1, overflow: "auto" }}>
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
