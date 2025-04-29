import type { Metadata } from "next";
import { geistSans, geistMono, roboto } from "../../public/fonts/googlefonts";
import "./globals.css";
import React from "react";
import { Providers } from "./utils/providers";

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
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
        style={{ margin: 0, padding: 0, overflow: "hidden" }}
      >
        <div className="flex h-screen">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
