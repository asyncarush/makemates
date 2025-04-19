module.exports = {
  apps: [
    {
      name: "makemates-backend",
      script: "./dist/index.js", // Your app's entry point
      instances: "max", // Use all CPU cores (for scalability)
      exec_mode: "cluster", // Cluster mode for load balancing
      watch: false, // Set to true to restart on file changes
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 2000, // pass this down explicitly if needed
      },
    },
  ],
};
