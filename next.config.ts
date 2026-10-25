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
    // The client router predicts the shape of routes it hasn't fetched yet
    // from ones it has. With this proxy the prediction is wrong: /de and
    // /sv match the [locale] segment directly, so the router learns that
    // "/<anything>" is a locale's homepage, while English is unprefixed and
    // rewritten to /en. A link like /contact?services=branding was then
    // prefetched as the homepage of a "contact" locale and 404'd. With
    // prediction off, the router asks the server for unknown routes.
    optimisticRouting: false,
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
