/** @type {import('next').NextConfig} */
// (https://placehold.co/400x400?text=Image)

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "http",
        hostname: "192.168.49.2",
        port: "32184",
      },
    ],
  },
  reactStrictMode: false,
  output: "standalone",
};

module.exports = nextConfig;
