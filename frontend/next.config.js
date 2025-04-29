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
        protocol: "http",
        hostname: "104.197.136.197",
        port: "31927",
      },
      {
        protocol: "https",
        hostname: "minio-api.asyncarush.com",
      },
    ],
  },
  reactStrictMode: false,
  output: "standalone",
};

module.exports = nextConfig;
