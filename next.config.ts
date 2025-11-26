import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "watch-this"; // ← Change this to your actual repo name!

const nextConfig: NextConfig = {
  output: "export",
  
  // GitHub Pages needs these for correct asset paths
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
