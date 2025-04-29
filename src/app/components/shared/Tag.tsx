import React from "react";

interface TagProps {
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({ label, icon, children }) => {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm border border-green-500 text-green-500 bg-green-500/10">
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{label}</span>
      {children}
    </div>
  );
};
