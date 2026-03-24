import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* Removed 'output: export' — static export is incompatible with Next.js server features (API routes, server components, etc.) */
  allowedDevOrigins: ['*.replit.dev', '*.worf.replit.dev', '*.janeway.replit.dev'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
