import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Memberitahu Turbopack lokasi akar sebenarnya
  experimental: {
    turbo: {
      root: __dirname,
    }
  },
  // Mengabaikan error tipe data yang ketat saat deploy
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
