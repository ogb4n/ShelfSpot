import React from "react";
import { Providers } from "../utils/providers";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <header className="flex-shrink-0"></header>
      <div className="flex-grow overflow-auto">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}
