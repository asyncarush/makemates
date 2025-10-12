const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
      },
    ],
  },
  reactStrictMode: false,
  output: "standalone",
};

module.exports = nextConfig;
