import crypto from "crypto";

const VAPI_PUBLIC_API_KEY = process.env.VAPI_PUBLIC_API_KEY || "";

export const startWebCallForMeeting = async ({ assistantId, context }) => {
  if (!VAPI_PUBLIC_API_KEY) {
    return {
      callId: `mock-call-${crypto.randomBytes(6).toString("hex")}`,
      joinConfig: {
        mock: true,
        assistantId,
        publicApiKey: "missing VAPI_PUBLIC_API_KEY",
        context,
      },
    };
  }

  return {
    callId: `web-call-${crypto.randomBytes(6).toString("hex")}`,
    joinConfig: {
      assistantId,
      publicApiKey: VAPI_PUBLIC_API_KEY,
      context,
    },
  };
};

