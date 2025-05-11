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
    <div className="flex flex-row min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 ml-[220px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
