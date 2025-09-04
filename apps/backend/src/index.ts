import { httpServer } from "./server";
import { config, validateConfig } from "./config";

// Validate configuration on startup
validateConfig();

httpServer.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down server.");
  process.exit();
});
