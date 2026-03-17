import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

export const isStreamConfigured = Boolean(apiKey && apiSecret);

export const chatClient = StreamChat.getInstance(apiKey, apiSecret); // will be used chat features
export const streamClient = new StreamClient(apiKey, apiSecret); // will be used for video calls

export function assertStreamConfigured() {
  if (!isStreamConfigured) {
    const error = new Error("Stream is not configured");
    error.statusCode = 500;
    error.exposeMessage = "Stream video is not configured on the server";
    throw error;
  }
}

export async function ensureStreamUser(user) {
  assertStreamConfigured();

  if (!user?.clerkId) {
    const error = new Error("User is missing clerkId");
    error.statusCode = 400;
    error.exposeMessage = "Unable to initialize session user";
    throw error;
  }

  await chatClient.upsertUser({
    id: user.clerkId.toString(),
    name: user.name,
    image: user.profileImage,
  });
}

export const upsertStreamUser = async (userData) => {
  try {
    assertStreamConfigured();
    await chatClient.upsertUser(userData);
    console.log("Stream user upserted successfully:", userData);
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    if (!isStreamConfigured) return;
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting the Stream user:", error);
  }
};
