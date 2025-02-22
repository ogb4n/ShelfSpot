"use client";
import React from "react";
import { Box, Typography } from "@mui/joy";
import { useSession } from "next-auth/react";

export const AdminPanel = () => {
  const { data } = useSession();
  console.log(data);
  if (data?.user?.admin) {
    return (
      <Box>
        <Typography>Admin Panel</Typography>
      </Box>
    );
  }
  return null;
};
