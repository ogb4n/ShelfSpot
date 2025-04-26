import type { Metadata } from "next";
import Navbar from "@/app/components/shared/Navbar/Navbar";
import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { geistSans, geistMono, roboto } from "../../../public/fonts/googlefonts";
import { Providers } from "../utils/providers";
import Sheet from "@mui/joy/Sheet";

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
    <>
      <header style={{ flexShrink: 0 }}>
        <Navbar />
      </header>
      <Sheet style={{ flexGrow: 1, overflow: "auto" }}>
        <Providers>{children}</Providers>
      </Sheet>
    </>
  );
}
