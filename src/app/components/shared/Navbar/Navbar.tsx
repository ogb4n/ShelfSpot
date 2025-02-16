"use client";
import * as React from "react";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import {
  SearchRoundedIcon,
  SettingsRoundedIcon,
  LogoutRoundedIcon,
  LuCodepen,
} from "@/app/utils/icons";

import { redirect } from "next/navigation";

import { useSession, signOut } from "next-auth/react";
import theme from "@/app/theme";

import { tabs } from "./constants";

export const Sidebar: React.FC = () => {
  const handleSignOut = async () => {
    signOut();
  };

  const session = useSession();

  const user = session.data?.user;
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 10000,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: theme.colorSchemes.dark.palette.secondary[500],
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)",
          },
        }}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <IconButton
          onClick={() => redirect("dashboard")}
          variant="soft"
          size="sm"
        >
          <LuCodepen />
        </IconButton>
        <Typography level="title-lg">ShelfSpot</Typography>
      </Box>
      <Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Search"
      />
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          "& .ListItemButton-root": {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
          }}
        >
          {tabs.map((tab) => (
            <ListItem key={tab.label}>
              <ListItemButton onClick={() => redirect(tab.href)}>
                {tab.icon()}
                <ListItemContent>
                  <Typography level="title-sm">{tab.label}</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <List
          size="sm"
          sx={{
            mt: "auto",
            flexGrow: 0,
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
            "--List-gap": "8px",
            mb: 2,
          }}
        >
          <ListItem>
            <ListItemButton onClick={() => redirect("/settings")}>
              <SettingsRoundedIcon />
              Configure
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">{user?.name}</Typography>
          <Typography level="body-xs">{user?.email}</Typography>
        </Box>
        <IconButton
          size="sm"
          variant="plain"
          color="neutral"
          onClick={() => handleSignOut()}
        >
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
};

export default Sidebar;
