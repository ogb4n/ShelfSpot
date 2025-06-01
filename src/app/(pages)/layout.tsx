import type { Metadata } from "next";
import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

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
    <div className="flex flex-row w-full relative overflow-hidden">
      {/* Animated purple blobs background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-15vw] top-1/4 w-[50vw] h-[50vw] bg-gradient-to-br from-violet-700 via-violet-500 to-fuchsia-700 opacity-60 blur-3xl animate-blob1" />
        <div className="absolute right-[-15vw] top-1/2 w-[50vw] h-[50vw] bg-gradient-to-br from-fuchsia-700 via-violet-500 to-violet-700 opacity-60 blur-3xl animate-blob2" />
      </div>
      <Sidebar />
      <div className="flex-1 md:ml-[220px] overflow-y-auto pb-[72px] md:pb-0 z-10">
        {children}
      </div>
    </div>
  );
}
