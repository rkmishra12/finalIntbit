import { assertStreamConfigured, chatClient, ensureStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    assertStreamConfigured();
    await ensureStreamUser(req.user);

    // use clerkId for Stream (not mongodb _id)=> it should match the id we have in the stream dashboard
    const token = chatClient.createToken(req.user.clerkId);

    res.status(200).json({
      token,
      userId: req.user.clerkId,
      userName: req.user.name,
      userImage: req.user.profileImage,
    });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(error.statusCode || 500).json({ message: error.exposeMessage || "Internal Server Error" });
  }
}
