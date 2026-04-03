import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.replit.dev', '*.worf.replit.dev', '*.janeway.replit.dev', '*.spock.replit.dev', '*.picard.replit.dev'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  async rewrites() {
    return [
      {
        // Proxy /backend/* → FastAPI on localhost:8000
        source: '/backend/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co',       port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com',port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos',      port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;
