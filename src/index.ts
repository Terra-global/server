import http from "http";
import app from "./app";
import { config } from "./config/env";
import prisma from "./config/database";
import { initSocket } from "./socket";

async function main() {
  // Test database connection
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL");
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io
  initSocket(server);

  // Start server
  server.listen(config.port, "0.0.0.0", () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║    🚀 Terra Mobile Server Running!        ║
  ║                                          ║
  ║    Port: ${config.port}                          ║
  ║    Env:  ${config.nodeEnv.padEnd(28)}║
  ║    API:  http://localhost:${config.port}/api       ║
  ║    WS:   ws://localhost:${config.port}             ║
  ╚══════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
