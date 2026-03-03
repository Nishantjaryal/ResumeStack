"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/data/env/client";
import { JobInfoTable } from "@/drizzle/schema";
import CondencedMessages from "@/services/hume/components/condencedMessages";
import { condencedChatMessages } from "@/services/hume/lib/condensedChatMessages";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import {
  BotIcon,
  LoaderIcon,
  MicIcon,
  MicOffIcon,
  PhoneCall,
  PhoneOffIcon,
  SparklesIcon,
  UserIcon,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

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
    imageUrl?: string;
  };
}

const StartCall = ({ jobInfo, accessToken, user }: StartCallProps) => {
  const { readyState, fft } = useVoice();
  const isConnecting = readyState === VoiceReadyState.CONNECTING;
  const isConnected = readyState === VoiceReadyState.OPEN;

  const displayName =
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Dear Candidate";

  const maxAiFft = Array.isArray(fft) && fft.length > 0 ? Math.max(...fft) : 0;

  return (
    <section className="relative min-h-[74vh] rounded-2xl border bg-card p-4 shadow-sm md:p-5">
      <header className="mb-4 flex items-center justify-between rounded-xl border bg-background/80 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Interview Call</p>
          <p className="text-xs text-muted-foreground">
            {jobInfo.jobTitle || "Job role"}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {isConnecting ? "Connecting..." : isConnected ? "Live" : "Ready"}
        </p>
      </header>

      <div className="grid min-h-[56vh] grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-4">
          <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-2">
            <ParticipantCard
              badge="You"
              name={displayName}
              icon={<UserIcon className="size-5" />}
              status={isConnected ? "Active" : "Waiting"}
            />
            <ParticipantCard
              badge="AI"
              name="Interview Assistant"
              icon={<BotIcon className="size-5" />}
              status={maxAiFft > 0 ? "Speaking" : "Listening"}
              rightSlot={
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-muted-foreground">
                  <SparklesIcon className="size-3.5" />
                  {maxAiFft > 0 ? "Speaking" : "Listening"}
                </span>
              }
            />
          </div>
        </div>

        <aside className="lg:col-span-1">
          <Message user={user} className="h-full" />
        </aside>
      </div>

      <Controls jobInfo={jobInfo} accessToken={accessToken} user={user} />
    </section>
  );
};

function Controls({ jobInfo, accessToken, user }: StartCallProps) {
  //   const [isCameraOn, setIsCameraOn] = useState(true);
  const {
    connect,
    disconnect,
    micFft,
    readyState,
    isMuted,
    mute,
    unmute,
    callDurationTimestamp,
  } = useVoice();

  const isConnected = readyState === VoiceReadyState.OPEN;
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  const displayName =
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Dear Candidate";

  const startSession = () => {
    connect({
      auth: { type: "accessToken", value: accessToken },
      configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
      sessionSettings: {
        type: "session_settings",
        variables: {
          userName: displayName,
          jobTitle: jobInfo.jobTitle || "Not provided",
          description: jobInfo.description,
          experienceLevel: jobInfo.experiencelevel,
        },
      },
    })
      .then(() => {
        console.log("Connected successfully");
      })
      .catch((error) => {
        console.error("Error connecting to voice session:", error);
      });
  };

  return (
    <div className="sticky bottom-6 mt-5 flex justify-center">
      <div className="flex w-fit items-center gap-2 rounded-full border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
        <Button
          type="button"
          size="sm"
          className="bg-primary/20 rounded-full"
          variant={isMuted ? "secondary" : "ghost"}
          onClick={() => {
            isMuted ? unmute() : mute();
          }}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </Button>

        {/* <Button
          type="button"
          size="icon"
          variant={isCameraOn ? "ghost" : "secondary"}
          onClick={() => setIsCameraOn((prev) => !prev)}
          aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {isCameraOn ? <VideoIcon /> : <VideoOffIcon />}
        </Button> */}

        {!isConnected ? (
          <div className="flex items-center justify-center">
            <Button
              type="button"
              size="sm"
              className="pointer-events-auto flex rounded-full"
              onClick={startSession}
              disabled={isConnecting}
            >
                <span className="flex gap-2">
                     {isConnecting ? <LoaderIcon className="animate-spin" /> : null}
              {isConnecting ? (
                <span className="flex gap-2 justify-center items-center "><PhoneCall className="animate-pulse" /> Connecting</span> 
              ) : (
                <span className="flex gap-2 justify-center items-center"><PhoneCall /> Start Call</span>
              )}
                </span>
             
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => disconnect()}
          >
            <PhoneOffIcon /> End Call
          </Button>
        )}

        {callDurationTimestamp?<div className="px-1 text-xs tabular-nums text-muted-foreground">
          {callDurationTimestamp}
        </div>: null}
      </div>

      <div className="px-2">
        <FFTVisualizer fftData={micFft} />
      </div>
    </div>
  );
}

function Message({
  user,
  className,
}: {
  user: StartCallProps["user"];
  className?: string;
}) {
  const { messages, fft } = useVoice();

  const condencedMessages = useMemo(() => {
    return condencedChatMessages(messages);
  }, [messages]);

  const maxFft = Array.isArray(fft) && fft.length > 0 ? Math.max(...fft) : 0;

  return (
    <CondencedMessages
      messages={condencedMessages}
      user={user}
      maxFft={maxFft}
      className={className}
    />
  );
}

function ParticipantCard({
  badge,
  name,
  icon,
  status,
  rightSlot,
}: {
  badge: string;
  name: string;
  icon: ReactNode;
  status: string;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[280px] flex-col justify-between rounded-xl border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          {icon}
          {badge}
        </span>
        {rightSlot}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        <p className="text-sm font-medium">{name}</p>
      </div>

      <p className="text-xs text-muted-foreground">{status}</p>
    </div>
  );
}

function FFTVisualizer({ fftData }: { fftData: number[] | null }) {
  if (!fftData || fftData.length === 0) return null;
  const maxFft = Math.max(...fftData);
  if (maxFft <= 0) {
    return <div className="h-8 w-10" />;
  }

  return (
    <div className="flex h-8 items-end justify-center gap-0.5">
      {fftData.slice(0, 12).map((value, index) => (
        <div
          key={index}
          className="w-0.5 rounded-full bg-primary/70 transition-all"
          style={{ height: `${Math.max((value / maxFft) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}

export default StartCall;
