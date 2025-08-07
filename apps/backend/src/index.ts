import { httpServer } from "./server";
import "dotenv/config";

const port = process.env.PORT || "3000";

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down server.");
  process.exit();
});
