"use client";
import * as React from "react";
import {
  SearchRoundedIcon,
  SettingsRoundedIcon,
  LogoutRoundedIcon,
  LuCodepen,
} from "@/app/assets/icons";

import { redirect } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { tabs } from "./constants";

export const Navbar: React.FC = () => {
  const handleSignOut = async () => {
    await signOut();
  };

  const session = useSession();
  const user = session.data?.user;

  // Add CSS variables to :root to maintain sidebar width consistency
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', '220px');
    // Ensure the sidebar is visible by default
    document.documentElement.style.setProperty('--sideNavigation-slideIn', '1');
  }, []);

  return (
    <aside
      className="sidebar fixed md:sticky h-screen w-[220px] flex flex-col gap-4 p-4 z-50 border-r border-gray-700 bg-[#1a1a1a]"
      style={{
        top: 0,
      }}
    >
      {/* Logo and app name */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => redirect("dashboard")}
          className="p-1.5 rounded-md bg-[#335C67]/20 text-[#335C67]"
        >
          <LuCodepen />
        </button>
        <h1 className="text-lg font-bold text-white">ShelfSpot</h1>
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          className="w-full pl-8 pr-2 py-1.5 bg-[#2a2a2a] text-white border border-gray-700 rounded-md text-sm"
          placeholder="Search"
        />
        <SearchRoundedIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Navigation menu */}
      <div className="flex-grow overflow-y-auto flex flex-col">
        {/* Main navigation links */}
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.label}>
              <button
                onClick={() => redirect(tab.href)}
                className="flex items-center gap-2 p-2 w-full rounded-md hover:bg-[#2a2a2a] transition-colors"
              >
                <span className="text-gray-400">{tab.icon()}</span>
                <span className="text-sm font-medium text-white">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Settings link */}
        <ul className="mt-auto mb-4">
          <li>
            <button
              onClick={() => redirect("/settings")}
              className="flex items-center gap-2 p-2 w-full rounded-md hover:bg-[#2a2a2a] transition-colors"
            >
              <span className="text-gray-400"><SettingsRoundedIcon /></span>
              <span className="text-sm font-medium text-white">Configure</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-700 w-full"></div>

      {/* User info and logout */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate text-white">{user?.name}</p>
          <p className="text-xs truncate text-gray-400">{user?.email}</p>
        </div>
        <button
          className="p-1.5 rounded-full hover:bg-[#2a2a2a] text-gray-400"
          onClick={() => handleSignOut()}
        >
          <LogoutRoundedIcon className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
