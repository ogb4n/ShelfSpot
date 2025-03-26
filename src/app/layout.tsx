import type { Metadata } from "next";
import { geistSans, geistMono, roboto } from "../../public/fonts/googlefonts";
import "./globals.css";
import React from "react";
import { Providers } from "./utils/providers";

import Sheet from "@mui/joy/Sheet";

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
        <Sheet style={{ display: "flex", height: "100vh" }}>
          <Sheet style={{ flexGrow: 1, overflow: "auto" }}>
            <Providers>{children}</Providers>
          </Sheet>
        </Sheet>
      </body>
    </html>
  );
}
