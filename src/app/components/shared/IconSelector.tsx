"use client";
import React from "react";
import { availableIcons } from "@/app/utils/icons";
import { type IconName } from "lucide-react/dynamic";

interface IconSelectorProps {
  selectedIcon: IconName;
  onSelect: (iconName: IconName) => void;
}

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
        className="w-full border-gray-300 rounded-sm p-2"
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
