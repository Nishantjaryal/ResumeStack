"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/data/env/client";
import { JobInfoTable } from "@/drizzle/schema";
import { CreateInterview, updateInterview } from "@/features/interviews/action";
import { interviewError } from "@/features/interviews/interviewerrors";
import CondencedMessages from "@/services/hume/components/condencedMessages";
import { condencedChatMessages } from "@/services/hume/lib/condensedChatMessages";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import {
  BotIcon,
  LoaderIcon,
  Mic,
  MicIcon,
  MicOffIcon,
  PhoneCall,
  PhoneOffIcon,
  SparklesIcon,
  UserIcon,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { set } from "zod";

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
    <section className="relative h-full bg-card overflow-hidden">
      <div className="grid min-h-[40vh] grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-1">
            <ParticipantCard
              badge="You"
              name={displayName}
              icon={
                <img
                  src={user.imageUrl || "/default-avatar.png"}
                  alt="User avatar"
                  className="w-25 rounded-full"
                />
              }
              badgeIcon={
                <img
                  src={user.imageUrl || "/default-avatar.png"}
                  alt="User avatar"
                  className="w-5 rounded-full"
                />
              }
              status={isConnected ? "Active" : "Waiting"}
              rightSlot={
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-muted-foreground">
                  <Mic className="size-3.5"/>
                  {isConnected ? "Active" : "Waiting"}
                </span>
              }
            />
            <ParticipantCard
              badge="AI"
              name="Interview Assistant"
              icon={<BotIcon className="w-20 h-20 text-primary" />}
              badgeIcon={<BotIcon className="w-5 h-5 text-primary" />}
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

        <aside className="lg:col-span-4">
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
    chatMetadata
  } = useVoice();
  const durationRef = useRef(callDurationTimestamp)
  const router = useRouter();
  const [interviewIdState, setInterViewIDstate] = useState<string | null>(null);
  durationRef.current = callDurationTimestamp
// sync interviewIdState with chatMetadata.chatId
  useEffect(() => {
    if(chatMetadata?.chatId == null || interviewIdState == null){
return    }
updateInterview(interviewIdState, {humeChatId: chatMetadata.chatId})
  }, [chatMetadata?.chatId, interviewIdState])

  // sync duration with timestamps
  useEffect(() => {
    if(interviewIdState == null){
return    }
const intervalid = setInterval(() => {
    if(durationRef.current == null){
        return
    }
    updateInterview(interviewIdState, {duration: durationRef.current})
}, 10000)

return () => clearInterval(intervalid)
  }, [interviewIdState])


  // handle disconnect to update interview with final duration and set humeChatId to null
  useEffect(() => {
    if(readyState !== VoiceReadyState.CLOSED){
        return
    } 
    if(interviewIdState == null){
      router.push(`/app/job-info/${jobInfo.id}/interview `)
      return
    }
    if(durationRef.current == null){
        return
    }
    updateInterview(interviewIdState, {duration: durationRef.current})

    router.push(`/app/job-info/${jobInfo.id}/interview/${interviewIdState} `)
  }, [readyState,interviewIdState, router, jobInfo.id])


  const isConnected = readyState === VoiceReadyState.OPEN;
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  const displayName =
    user.name ||
    [user.firstName].filter(Boolean).join(" ") ||
    user.email ||
    "Dear Candidate";

  const startSession = async () => {
    const res = await CreateInterview({jobInfoId: jobInfo.id});
    if(res.error){
      interviewError(res.message);
      return;
    }
    setInterViewIDstate(res.interviewId);
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
    <div className="sticky bottom-3 mt-5 flex justify-center transition-all">
      <div className="flex w-fit items-center gap-2 rounded-full border bg-background/95 px-3 py-2 shadow-md backdrop-blur transition-all">
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
          <div className="flex items-center justify-center gap-2 transition-all">
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
                  <span className="flex gap-2 justify-center items-center ">
                    <PhoneCall className="animate-pulse" /> Connecting
                  </span>
                ) : (
                  <span className="flex gap-2 justify-center items-center">
                    <PhoneCall /> Start Call
                  </span>
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

        {callDurationTimestamp ? (
          <div className="px-1 text-xs tabular-nums text-muted-foreground">
            {callDurationTimestamp}
          </div>
        ) : null}
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
      className={"h-full min-h-56"}
    />
  );
}

function ParticipantCard({
  badge,
  name,
  icon,
  badgeIcon,
  status,
  rightSlot,
}: {
  badge: string;
  name: string;
  icon: ReactNode;
  badgeIcon: ReactNode;
  status: string;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[280px] flex-col justify-between rounded-xl border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          {badgeIcon}
          {badge}
        </span>
        {rightSlot}
      </div>

      <div className="mb-3 flex flex-col gap-4 w-full h-full items-center justify-center rounded-lg my-2 text-muted-foreground bg-primary/10">
        {icon}
        <p className="text-sm font-medium">{name}</p>
      </div>
    </div>
  );
}

function FFTVisualizer({ fftData }: { fftData: number[] | null }) {
  if (!fftData || fftData.length === 0) return null;
  const maxFft = Math.max(...fftData);
  if (maxFft <= 0) {
    return null;
  }

  return (
    <div className=" transition-all flex h-8 items-end justify-center gap-0.5">
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
