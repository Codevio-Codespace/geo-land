import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/services.html', destination: '/services', permanent: true },
      { source: '/projects.html', destination: '/projects', permanent: true },
      { source: '/technology.html', destination: '/technology', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/project-template.html', destination: '/projects', permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;
