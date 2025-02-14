"use client";
import { extendTheme } from "@mui/joy/styles";

declare module "@mui/joy/styles" {
  interface Palette {
    secondary: {
      50?: string;
      100?: string;
      200?: string;
      300?: string;
      400?: string;
      500?: string;
      600?: string;
      700?: string;
      800?: string;
      900?: string;
    };
  }
}

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          500: "#335C67",
        },
        secondary: {
          500: "#4FAE62",
        },
        danger: {
          500: "#9E2A2B",
        },
        warning: {
          500: "#E09F3E",
        },
      },
    },
  },
});

export default theme;
