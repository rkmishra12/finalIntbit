import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { ENV } from "./env.js";

const DEFAULT_TIMEOUT_MS = Number(ENV.CODE_EXECUTION_TIMEOUT_MS) || 5000;
const DEFAULT_MEMORY_MB = Number(ENV.CODE_EXECUTION_MEMORY_MB) || 256;
const DEFAULT_CPU_COUNT = Number(ENV.CODE_EXECUTION_CPU_COUNT) || 1;
const MAX_SOURCE_BYTES = Number(ENV.CODE_EXECUTION_MAX_SOURCE_BYTES) || 50_000;
const MAX_OUTPUT_BYTES = Number(ENV.CODE_EXECUTION_MAX_OUTPUT_BYTES) || 64_000;
const WORKSPACE_DIR = "/workspace";
const TMPFS_SIZE = "64m";

const LANGUAGE_CONFIG = {
  javascript: {
    image: ENV.DOCKER_JS_IMAGE || "node:20-alpine",
    fileName: "main.js",
    command: "node /workspace/main.js",
  },
  python: {
    image: ENV.DOCKER_PYTHON_IMAGE || "python:3.11-alpine",
    fileName: "main.py",
    command: "python /workspace/main.py",
  },
  java: {
    image: ENV.DOCKER_JAVA_IMAGE || "eclipse-temurin:21-jdk-alpine",
    fileName: "Solution.java",
    command:
      "mkdir -p /tmp/classes && javac -d /tmp/classes /workspace/Solution.java && java -cp /tmp/classes Solution",
  },
};

export function validateExecutionRequest(language, code) {
  if (!LANGUAGE_CONFIG[language]) {
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

export async function runCodeInSandbox({ language, code }) {
  const config = LANGUAGE_CONFIG[language];
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "intbit-code-"));
  const sourcePath = path.join(tempDir, config.fileName);

  try {
    await fs.writeFile(sourcePath, code, "utf8");

    const result = await runDockerCommand(buildDockerRunConfig(config, tempDir));

    if (result.timedOut) {
      return {
        success: false,
        output: truncateOutput(result.stdout),
        error: `Execution timed out after ${DEFAULT_TIMEOUT_MS}ms`,
      };
    }

    if (result.spawnError) {
      return {
        success: false,
        error: formatSpawnError(result.spawnError),
      };
    }

    const stdout = truncateOutput(result.stdout);
    const stderr = truncateOutput(result.stderr);

    if (result.exitCode !== 0) {
      return {
        success: false,
        output: stdout,
        error: stderr || "Execution failed",
      };
    }

    return {
      success: true,
      output: stdout || "No output",
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function buildDockerRunConfig(config, tempDir) {
  const containerName = `intbit-runner-${randomUUID()}`;

  return {
    containerName,
    args: [
      "run",
      "--rm",
      "--pull",
      "never",
      "--name",
      containerName,
      "--network",
      "none",
      "--read-only",
      "--tmpfs",
      `/tmp:rw,noexec,nosuid,size=${TMPFS_SIZE}`,
      "--mount",
      `type=bind,src=${tempDir},dst=${WORKSPACE_DIR},readonly`,
      "--workdir",
      WORKSPACE_DIR,
      "--user",
      "65534:65534",
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges",
      "--pids-limit",
      "64",
      "--memory",
      `${DEFAULT_MEMORY_MB}m`,
      "--cpus",
      String(DEFAULT_CPU_COUNT),
      config.image,
      "sh",
      "-lc",
      config.command,
    ],
  };
}

function runDockerCommand({ args, containerName }) {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let spawnError = null;

    const child = execFile(
      "docker",
      args,
      {
        timeout: DEFAULT_TIMEOUT_MS,
        windowsHide: true,
        maxBuffer: MAX_OUTPUT_BYTES * 2,
      },
      (error) => {
        if (error?.killed && error.signal) {
          timedOut = true;
        }

        if (error?.code === "ENOENT") {
          spawnError = error;
        }
      }
    );

    child.stdout?.on("data", (chunk) => {
      stdout = appendChunk(stdout, chunk);
    });

    child.stderr?.on("data", (chunk) => {
      stderr = appendChunk(stderr, chunk);
    });

    child.on("error", (error) => {
      spawnError = error;
    });

    child.on("close", async (exitCode, signal) => {
      if (signal && signal.toUpperCase().includes("TERM")) {
        timedOut = true;
      }

      if (timedOut) {
        await forceRemoveContainer(containerName);
      }

      resolve({ exitCode, signal, stdout, stderr, timedOut, spawnError });
    });
  });
}

function forceRemoveContainer(containerName) {
  return new Promise((resolve) => {
    const child = execFile("docker", ["rm", "-f", containerName], { windowsHide: true });

    child.on("error", () => resolve());
    child.on("close", () => resolve());
  });
}

function appendChunk(currentValue, chunk) {
  const nextValue = currentValue + chunk.toString("utf8");

  if (Buffer.byteLength(nextValue, "utf8") <= MAX_OUTPUT_BYTES) {
    return nextValue;
  }

  return truncateOutput(nextValue);
}

function truncateOutput(value) {
  const buffer = Buffer.from(value || "", "utf8");

  if (buffer.length <= MAX_OUTPUT_BYTES) {
    return buffer.toString("utf8");
  }

  const suffix = "\n...[output truncated]";
  const allowedLength = MAX_OUTPUT_BYTES - Buffer.byteLength(suffix, "utf8");
  return buffer.subarray(0, Math.max(allowedLength, 0)).toString("utf8") + suffix;
}

function formatSpawnError(error) {
  if (error?.code === "ENOENT") {
    return "Docker CLI is not available on the server. Install Docker and pre-pull the runtime images.";
  }

  return `Execution service failed to start: ${error.message}`;
}
