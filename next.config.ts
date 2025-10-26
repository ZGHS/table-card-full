import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  /* 解决Next.js推断工作区根目录的警告 */
  outputFileTracingRoot: path.resolve(__dirname),
  reactCompiler: true,
};

export default nextConfig;
