import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //  configure the remote image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xrffezotnatkxmswlawm.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;