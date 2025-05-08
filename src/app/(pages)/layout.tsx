import type { Metadata } from "next";
import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

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
      <main className="flex-1 ml-[220px]">
        {children}
      </main>
    </>
  );
}
