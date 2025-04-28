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
        port: "30698",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
      },
      {
        protocol: "https",
        hostname: "minio-api.asyncarush.com",
        port: "30854",
      },
    ],
  },
  reactStrictMode: false,
  output: "standalone",
};

module.exports = nextConfig;
