import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    if (loadingSession) {
      setIsInitializingCall(true);
      return undefined;
    }

    if (!session?.callId || session.status === "completed" || (!isHost && !isParticipant)) {
      setStreamClient(null);
      setCall(null);
      setChatClient(null);
      setChannel(null);
      setIsInitializingCall(false);
      return undefined;
    }

    let isCancelled = false;
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      setIsInitializingCall(true);

      try {
        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();
        if (isCancelled) return;

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        if (isCancelled) return;

        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        await videoCall.join({ create: false });
        if (isCancelled) return;
        setCall(videoCall);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        if (isCancelled) return;
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        if (isCancelled) return;
        setChannel(chatChannel);
      } catch (error) {
        if (!isCancelled) {
          toast.error(error.response?.data?.message || error.message || "Failed to join video call");
        }
        console.error("Error init call", error);
      } finally {
        if (!isCancelled) {
          setIsInitializingCall(false);
        }
      }
    };

    initCall();

    // cleanup - performance reasons
    return () => {
      isCancelled = true;
      // iife
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session?.callId, session?.status, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
