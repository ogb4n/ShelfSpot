import type { Metadata } from "next";
import Navbar from "@/app/components/shared/Navbar/Navbar";
import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { geistSans, geistMono } from "../../../public/fonts/googlefonts";
import { Providers } from "../utils/providers";

export const metadata: Metadata = {
  title: "ShelfSpot",
  description: "Keep an eye on your stocks",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session) {
    redirect("/register");
    return null;
  }
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
          <Providers>
            <div style={{ flexGrow: 1, overflow: "auto" }}>{children}</div>
          </Providers>
        </div>
      </body>
    </html>
  );
}
