// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactStrictMode: true,
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Ignore ESLint errors during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
