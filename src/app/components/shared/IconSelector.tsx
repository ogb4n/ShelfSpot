"use client";
import React from "react";
import { type IconName } from "lucide-react/dynamic";

interface IconSelectorProps {
  selectedIcon: IconName;
  onSelect: (iconName: IconName) => void;
}

const availableIcons: IconName[] = [
  "home",
  "user",
  "settings",
  "camera",
  "house",
  "warehouse",
  "cctv",
  "eye",
  "eye-off",
  "factory",
  "wallet",
  "boxes",
  "computer",
  "keyboard",
];

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onSelect,
}) => {
  return (
    <div>
      <label htmlFor="icon-selector" className="font-semibold">
        Icon
      </label>
      <select
        id="icon-selector"
        value={selectedIcon}
        onChange={(e) => onSelect(e.target.value as IconName)}
        className="w-full border-gray-300 rounded p-2"
      >
        {availableIcons.map((icon) => (
          <option key={icon} value={icon}>
            {icon}
          </option>
        ))}
      </select>
    </div>
  );
};
