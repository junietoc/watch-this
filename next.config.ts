import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: "export",
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
