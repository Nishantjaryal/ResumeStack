import { ConnectionMessage, JSONMessage } from "@humeai/voice-react"

type ChatEventMessage = {
    type: "USER_MESSAGE" | "AGENT_MESSAGE"
    messageText: string
}

type Message = JSONMessage | ConnectionMessage | ChatEventMessage

export type CondensedChatMessage = {
    isUser: boolean
    content: string
}

export const condencedChatMessages = (messages: Message[]) => {
    return messages.reduce((acc: CondensedChatMessage[], message) => {
        const data = getChatEventData(message) ?? getchatJSONMessageData(message)
        if (data == null) {
            return acc
        }

        const last_message = acc.at(-1)
        if (last_message == null) {
            acc.push(data)
            return acc
        }

        if (last_message.isUser === data.isUser) {
            last_message.content += " " + data.content
        } else {
            acc.push(data)
        }
        
        return acc
    }, [])
}

function getchatJSONMessageData(message: Message): CondensedChatMessage | null {
    if (message.type !== "user_message" && message.type !== "assistant_message") {
        return null
    }

    const content =
        ("message" in message &&
            typeof message.message === "object" &&
            message.message !== null &&
            "content" in message.message &&
            typeof message.message.content === "string"
            ? message.message.content
            : null) ??
        ("content" in message && typeof message.content === "string" ? message.content : null)

    if (content == null || content.trim().length === 0) {
        return null
    }

    return {
        isUser: message.type === "user_message",
        content,
    }
}

function getChatEventData(message: Message): CondensedChatMessage | null {
    if (
        (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") ||
        !("messageText" in message) ||
        typeof message.messageText !== "string"
    ) {
        return null
    }

    return {
        isUser: message.type === "USER_MESSAGE",
        content: message.messageText,
    }
}
    
        
    