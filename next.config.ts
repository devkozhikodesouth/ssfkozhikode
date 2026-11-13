import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Old public path of the Muta'allim Conference page
    return [{ source: "/mutaallim", destination: "/mutaallim-conference", permanent: true }];
  },
};

export default nextConfig;
