import app from "./src/app.js";
import env from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import logger from "./src/utils/logger.js";
import { startSchedulers } from "./src/services/scheduler.js";

const start = async () => {
  try {
    await connectDB();
    startSchedulers();
    app.listen(env.port, () =>
      logger.info(`Server running on http://localhost:${env.port} (${env.nodeEnv})`)
    );
  } catch (err) {
    logger.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();

process.on("unhandledRejection", (reason) => logger.error("Unhandled Rejection:", reason));
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});
