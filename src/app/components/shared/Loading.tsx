import React from "react";

interface LoadingProps {
  size?: number;
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 40,
  color = "#335C67",
  text = "Chargement...",
  fullScreen = false,
}) => {
  return (
    <div
      className={`flex items-center justify-center flex-col ${fullScreen
          ? "fixed top-0 left-0 w-full h-full bg-black/30 z-50"
          : "p-4"
        }`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="animate-spin"
          style={{ width: size, height: size }}
          viewBox="0 0 50 50"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80, 150"
          />
        </svg>
      </div>
      {text && <p className="mt-4 text-gray-400 text-sm">{text}</p>}
    </div>
  );
};

export default Loading;
