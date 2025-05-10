import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone', // Ajoute le mode standalone pour optimiser l'image Docker
};

export default nextConfig;
