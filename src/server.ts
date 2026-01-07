import { Server } from "http";
import app from "./app";
import { AIServices } from "./app/modules/AIChat/ai.service";
import config from "./config";
import { initializeSocket } from "./socket";

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log("Server is running on port", config.port);
  });

  // Initialize Socket.io
  const io = initializeSocket(server);
  console.log("Socket.io initialized");

  // Train AI Model
  await AIServices.trainAI();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("Shutting down gracefully...");
    io.close();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

main();
