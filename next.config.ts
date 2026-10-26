import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  devIndicators: false,
  basePath: (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, ''),
  images: { unoptimized: true },
};
export default config;
