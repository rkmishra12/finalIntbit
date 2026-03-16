import { runCodeInSandbox, validateExecutionRequest } from "../lib/codeExecution.js";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_CONCURRENT_RUNS = 1;
const executionBudget = new Map();

export async function executeCode(req, res) {
  const { language, code } = req.body ?? {};
  const validationError = validateExecutionRequest(language, code);

  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  const limiterKey = req.user?._id?.toString() || req.ip;
  const budgetState = getBudgetState(limiterKey);

  if (budgetState.activeRuns >= MAX_CONCURRENT_RUNS) {
    return res.status(429).json({
      success: false,
      error: "A code execution is already running for this user",
    });
  }

  if (budgetState.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: "Code execution rate limit exceeded. Try again in a minute.",
    });
  }

  budgetState.activeRuns += 1;
  budgetState.timestamps.push(Date.now());

  try {
    const result = await runCodeInSandbox({ language, code });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in executeCode controller:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    budgetState.activeRuns = Math.max(0, budgetState.activeRuns - 1);

    if (budgetState.activeRuns === 0 && budgetState.timestamps.length === 0) {
      executionBudget.delete(limiterKey);
    }
  }
}

function getBudgetState(key) {
  const now = Date.now();
  const existingState = executionBudget.get(key) ?? { timestamps: [], activeRuns: 0 };

  existingState.timestamps = existingState.timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);

  executionBudget.set(key, existingState);
  return existingState;
}
