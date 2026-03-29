/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  async rewrites() {
    return {
      fallback: [
        { source: '/:path*', destination: '/index.html' },
      ],
    };
  },
};

export default nextConfig;
