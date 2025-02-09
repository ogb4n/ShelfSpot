" use client";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import React from "react";

interface IconProps {
  name: IconName;
  color: string;
  size: number;
}

export const Icon: React.FC<IconProps> = ({ name, color, size }) => (
  <DynamicIcon name={name} color={color} size={size} />
);
