import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  devIndicators: false,
  turbopack: { root: __dirname },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
