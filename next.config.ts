import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    // Dynamic pages (cookie-authenticated) default to 0s in the Router Cache,
    // meaning every client-side navigation re-fetches from the server and
    // shows loading.tsx. Setting this to 30s makes already-visited pages
    // render instantly on re-navigation without stale data risk — revalidatePath
    // (called after every mutation) still busts the cache immediately.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

export default nextConfig;
