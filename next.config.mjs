import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    const projectRoot = path.resolve(process.cwd());
    config.resolve.alias['@'] = projectRoot;
    return config;
  },
  turbopack: {},
};

export default nextConfig;
