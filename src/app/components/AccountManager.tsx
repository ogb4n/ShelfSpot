"use client";
import React from "react";
import { Box, Typography } from "@mui/joy";
import useGetAccount from "../hooks/useGetAccount";

export const AccountManager = () => {
  const { account, loading, error } = useGetAccount();
  console.log(account);
  return (
    <Box>
      <Typography typography={"h4"}>Your profile</Typography>
    </Box>
  );
};
