import { Groq } from "groq-sdk"

const getGroqClient = (apiKey: string) => {
  const key = apiKey
  if (!key) throw new Error("Missing Groq API key")
  return new Groq({ apiKey: key })
}

export async function GroqResponse({
  message,
  modelName,
  systemPrompt,
}: {
  message: string
  modelName: string
  systemPrompt?: string
}) {
  try {
    const SYSTEM_PROMPT =
      systemPrompt ||
      "You are a very helpful, kind and intelligent ai agent, help users with their queries"

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      throw new Error("A valid message string is required.")
    }

    const groq = getGroqClient(process.env.GROQ_API_KEY || "")

    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    })

    const text = completion.choices[0]?.message?.content ?? ""

    if (!text || text.trim().length === 0) {
      throw new Error("Received empty response from Groq API.")
    }

    return text
  } catch (error) {
    console.error("[chat/route] Groq API error:", error)
    throw error
  }
}
