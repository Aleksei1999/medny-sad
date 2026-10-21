import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // статичная сборка для GitHub Pages
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // на exFAT macOS пишет рядом файлы ._*, и кеш Turbopack на диске ломается
  experimental: { turbopackFileSystemCacheForDev: false },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
