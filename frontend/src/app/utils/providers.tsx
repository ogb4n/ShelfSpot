"use client";

import React from "react";
import { AppProviders } from "../../lib/providers";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProviders>
      {children}
    </AppProviders>
  );
};
