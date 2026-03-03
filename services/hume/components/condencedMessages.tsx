
import { MessageSquareIcon } from "lucide-react";

interface User {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}


function CondencedMessages({
  messages,
  user,
  maxFft = 0,
  className,
}: {
  messages: { isUser: boolean; content: string }[];
  user: User;
  maxFft: number;
  className?: string;
}) {
  const displayName =
    user.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <section className={`h-full rounded-xl border bg-background ${className ?? ""}`}>
      <header className="flex items-center justify-between border-b px-3 py-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <MessageSquareIcon className="size-4" />
          Chat
        </div>
        <div className="text-[11px] text-muted-foreground">
          {maxFft > 0 ? "audio active" : "audio idle"}
        </div>
      </header>

      <div className="border-b px-3 py-2 text-xs text-muted-foreground">
        {displayName}
      </div>

      <div className="h-[calc(100%-5.6rem)] space-y-2 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversation yet.</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.isUser}-${index}`}
              className={`rounded-md border px-2 py-1.5 text-sm ${
                message.isUser ? "bg-primary/5" : "bg-muted/40"
              }`}
            >
              <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                {message.isUser ? "You" : "AI"}
              </p>
              <p>{message.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default CondencedMessages