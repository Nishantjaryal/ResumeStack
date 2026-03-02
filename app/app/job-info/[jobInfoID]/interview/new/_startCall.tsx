"use client";

import { env } from "@/data/env/client";
import { JobInfoTable } from "@/drizzle/schema";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { LoaderIcon } from "lucide-react";

interface StartCallProps {
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "jobTitle" | "description" | "experiencelevel"
  >;
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

const StartCall = ({ jobInfo, accessToken, user }: StartCallProps) => {
  const { connect, disconnect, readyState } = useVoice();

  if (
    readyState === VoiceReadyState.CONNECTING
  ) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoaderIcon className="animate-spin w-7 h-7" />
      </div>
    );
  }
  if (readyState === VoiceReadyState.OPEN) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <button
          onClick={() => {
            disconnect();
          }}
        >
          End Session
        </button>
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center w-full h-full">
      <button
        className=" bg-primary text-primary-foreground py-2 px-3 rounded-md  "
        onClick={() => {
          connect({
            auth: { type: "accessToken", value: accessToken },
            configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
            sessionSettings:{
                type: "session_settings",
                variables:{
                    userName:
                      user.name ||
                      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                      user.email ||
                      "Dear Candidate",
                    jobTitle: jobInfo.jobTitle || "Not provided",
                    description: jobInfo.description,
                    experienceLevel: jobInfo.experiencelevel,
                }
            }
          })
            .then(() => {
              console.log("Connected successfully");
            })
            .catch((error) => {
              console.error("Error connecting to voice session:", error);
            });
        }}
      >
        Start Session
      </button>
    </div>
  );
};

export default StartCall;
