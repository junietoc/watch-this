import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: "export",
  
  // If deploying to github.com/username/watch-this
  // Uncomment and set your repo name:
  // basePath: "/watch-this",
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
