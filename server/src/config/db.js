import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  mongoose.connection.on("error", (err) => logger.error("MongoDB error:", err.message));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

  return conn;
};

export default connectDB;
