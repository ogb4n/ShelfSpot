import React from "react";
import { Providers } from "../utils/providers";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed inset-0 w-full h-full bg-white dark:bg-gray-900">
      <Providers>{children}</Providers>
    </div>
  );
}
