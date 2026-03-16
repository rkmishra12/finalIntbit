import axiosInstance from "./axios";

/**
 * @param {string} language
 * @param {string} code
 * @returns {Promise<{success:boolean, output?:string, error?:string}>}
 */
export async function executeCode(language, code) {
  try {
    const { data } = await axiosInstance.post("/code-execution/run", { language, code });
    return data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to execute code";

    return {
      success: false,
      error: message,
    };
  }
}
