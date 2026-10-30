import type { NextConfig } from "next";

/** Old standalone pages now live as sections of the single-page home. */
const SECTION_ROUTES = ["about", "skills", "projects", "contact"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [75, 92, 95],
  },
  async redirects() {
    return SECTION_ROUTES.map((section) => ({
      source: `/${section}`,
      destination: `/#${section}`,
      permanent: false,
    }));
  },
};

export default nextConfig;
