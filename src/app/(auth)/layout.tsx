import React from "react";
import { geistSans, geistMono, roboto } from "../../../public/fonts/googlefonts";
import Sheet from "@mui/joy/Sheet";
import { Providers } from "../utils/providers";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <header style={{ flexShrink: 0 }}></header>
      <Sheet style={{ flexGrow: 1, overflow: "auto" }}>
        <Providers>{children}</Providers>
      </Sheet>
    </div>
  );
}
