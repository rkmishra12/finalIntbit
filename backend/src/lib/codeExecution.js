import { ENV } from "./env.js";

const MAX_SOURCE_BYTES = Number(ENV.CODE_EXECUTION_MAX_SOURCE_BYTES) || 50_000;
const CODE_EXECUTION_DISABLED_MESSAGE =
  "Code execution is disabled on this deployment for safety. Use a dedicated sandbox service if you need hosted code runs.";

const SUPPORTED_LANGUAGES = new Set(["javascript", "python", "java"]);

export function isCodeExecutionEnabled() {
  return ENV.CODE_EXECUTION_ENABLED;
}

export function validateExecutionRequest(language, code) {
  if (!SUPPORTED_LANGUAGES.has(language)) {
    return `Unsupported language: ${language}`;
  }

  if (typeof code !== "string" || !code.trim()) {
    return "Source code is required";
  }

  if (Buffer.byteLength(code, "utf8") > MAX_SOURCE_BYTES) {
    return `Source code exceeds the ${MAX_SOURCE_BYTES} byte limit`;
  }

  return null;
}

export async function runCodeInSandbox() {
  return {
    success: false,
    error: CODE_EXECUTION_DISABLED_MESSAGE,
  };
}
