import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  images: { unoptimized: true },
  reactCompiler: true,
  basePath: "/atcoder",
}

export default nextConfig
