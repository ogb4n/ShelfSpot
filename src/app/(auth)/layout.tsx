import React from "react";
import { Providers } from "../utils/providers";
import { HyperText } from "@/components/magicui/hyper-text";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <header className="flex-shrink-0"></header>
      <div className="flex-grow overflow-hidden flex flex-col items-center">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}
