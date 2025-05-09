import type { Metadata } from "next";
import { geistSans, geistMono, roboto } from "../../public/fonts/googlefonts";
import "./globals.css";
import React from "react";
import { Providers } from "./utils/providers";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Script pour appliquer le thème dès le chargement */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var theme = localStorage.theme;
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
})();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased bg-white dark:bg-black`}
        style={{ margin: 0, padding: 0, overflow: "hidden" }}
      >
        <Providers>
          <div className="flex h-screen flex-col">
            <div className="p-2 flex justify-end items-center gap-2">
            </div>
            <div className="flex-1 flex">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
