import React from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

interface LoadingProps {
  size?: number;
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "inherit";
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 40,
  color = "primary",
  text = "Chargement...",
  fullScreen = false,
}) => {
  const containerStyle: React.CSSProperties = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 9999,
      }
    : {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "1rem",
      };

  return (
    <Box sx={containerStyle}>
      <CircularProgress size={size} color={color} />
      {text && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
