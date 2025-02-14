import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import React from "react";
import { Providers } from "./contexts/ContextsProviders";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
// import theme from "./theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

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
        <AppRouterCacheProvider>
          {/* <ThemeProvider theme={theme}> */}
          <div style={{ display: "flex", height: "100vh" }}>
            <header style={{ flexShrink: 0 }}></header>
            <div style={{ flexGrow: 1, overflow: "auto" }}>
              <Providers>{children}</Providers>
            </div>
          </div>
          {/* </ThemeProvider> */}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
