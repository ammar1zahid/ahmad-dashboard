/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  webpack: (config, { isServer }) => {
    // Prevent mongoose from being resolved into client bundles by aliasing it to false
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        mongoose: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
