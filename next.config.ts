import type { NextConfig } from "next";

// Base path for a GitHub Pages *project* site (served at /<repo>).
// The deploy workflow sets NEXT_PUBLIC_BASE_PATH=/mida-landing; locally it's
// empty so `next dev` and normal builds keep working at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export", // static HTML/CSS/JS export into ./out for GitHub Pages
  trailingSlash: true, // emit /privacy/index.html so Pages serves clean URLs
  images: { unoptimized: true }, // required: no image optimization server on Pages
  basePath: basePath || undefined,
};

export default nextConfig;
