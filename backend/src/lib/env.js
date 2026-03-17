import dotenv from "dotenv";

dotenv.config({ quiet: true });

function parseBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  return value === "true";
}

export const ENV = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  CODE_EXECUTION_ENABLED: parseBoolean(process.env.CODE_EXECUTION_ENABLED, false),
  CODE_EXECUTION_TIMEOUT_MS: process.env.CODE_EXECUTION_TIMEOUT_MS,
  CODE_EXECUTION_MAX_SOURCE_BYTES: process.env.CODE_EXECUTION_MAX_SOURCE_BYTES,
};
