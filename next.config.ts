import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next.js's dev server blocks cross-origin requests to dev-only
  // assets/endpoints (including the HMR WebSocket) by default, accepting
  // only "localhost". Accessing the dev server via the machine's LAN IP
  // otherwise leaves the page permanently un-hydrated (the HMR socket
  // connection that `hydrate()` sets up never opens), which looks like
  // "only the header/footer render" since everything client-animated
  // stays at its server-rendered initial (invisible) state. Harmless in
  // production — `next build`/`next start` don't run this dev-only check.
  allowedDevOrigins: ["192.168.1.11"],
  experimental: {
    serverActions: {
      // Default is 1MB; admin image uploads go up to 5MB (projects) plus
      // multipart overhead, capped server-side at 10MB in `uploadImageAction`.
      bodySizeLimit: "12mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Remote CMS/Storage hosts (e.g. Supabase Storage) get added here later.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
