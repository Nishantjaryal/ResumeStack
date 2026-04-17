import {
  JobInfoTable,
  QuestionDifficulty,
  QuestionTable,
} from "@/drizzle/schema"
import { generateText, ModelMessage, streamText } from "ai"
import { google } from "./models/google"
import { GroqResponse } from "@/app/api/ai/questions/groq/route"

const MAX_ATTEMPTS = 3
const GROQ_QUESTION_MODEL = "llama-3.3-70b-versatile"

type QuestionJobInfo = Pick<
  typeof JobInfoTable.$inferSelect,
  "jobTitle" | "description" | "experiencelevel"
>

type PreviousQuestion = Pick<typeof QuestionTable.$inferSelect, "text" | "difficulty">

function getFallbackQuestion(difficulty: QuestionDifficulty) {
  return `### ${difficulty[0].toUpperCase()}${difficulty.slice(1)} Technical Question\n\nGiven the job description and experience level, explain how you would design and implement one core feature for this role. Include:\n\n- The architecture/components you would choose\n- Key trade-offs and risks\n- How you would test and monitor it in production`
}

function isQuotaOrRateLimitError(error: unknown) {
  if (typeof error !== "object" || error == null) return false

  const maybeError = error as {
    statusCode?: number
    message?: string
    lastError?: { statusCode?: number; message?: string }
  }

  const statusCode = maybeError.statusCode ?? maybeError.lastError?.statusCode
  if (statusCode === 429) return true

  const message = `${maybeError.message ?? ""} ${maybeError.lastError?.message ?? ""}`
    .toLowerCase()

  return message.includes("quota exceeded") || message.includes("resource_exhausted")
}

function getQuestionPromptConfig({
  jobInfo,
  previousQuestions,
  difficulty,
}: {
  jobInfo: QuestionJobInfo
  previousQuestions: PreviousQuestion[]
  difficulty: QuestionDifficulty
}) {
  const recentQuestions = previousQuestions.slice(0, 6).reverse()

  const previousMessages: ModelMessage[] = recentQuestions.flatMap(q => [
    { role: "user" as const, content: q.difficulty },
    { role: "assistant" as const, content: q.text },
  ])

  return {
    messages: [
      ...previousMessages,
      {
        role: "user" as const,
        content: difficulty,
      },
    ] as ModelMessage[],
    system: `You are an AI assistant that creates technical interview questions tailored to a specific job role. Your task is to generate one **realistic and relevant** technical question that matches the skill requirements of the job and aligns with the difficulty level provided by the user.

Job Information:
- Job Description: \`${jobInfo.description}\`
- Experience Level: \`${jobInfo.experiencelevel}\`
${jobInfo.jobTitle ? `\n- Job Title: \`${jobInfo.jobTitle}\`` : ""}

Guidelines:
- The question must reflect the skills and technologies mentioned in the job description.
- Make sure the question is appropriately scoped for the specified experience level.
- A difficulty level of "easy", "medium", or "hard" is provided by the user and should be used to tailor the question.
- Prefer practical, real-world challenges over trivia.
- Return only the question, clearly formatted (e.g., with code snippets or bullet points if needed). Do not include the answer.
- Return only one question at a time.
- It is ok to ask a question about just a single part of the job description, such as a specific technology or skill (e.g., if the job description is for a Next.js, Drizzle, and TypeScript developer, you can ask a TypeScript only question).
- The question should be formatted as markdown.
- Stop generating output as soon you have provided the full question.`,
  }
}

export function generateAiQuestion({
  jobInfo,
  previousQuestions,
  difficulty,
  onFinish,
}: {
  jobInfo: QuestionJobInfo
  previousQuestions: PreviousQuestion[]
  difficulty: QuestionDifficulty
  onFinish: (question: string) => void
}) {
  const promptConfig = getQuestionPromptConfig({
    jobInfo,
    previousQuestions,
    difficulty,
  })

  return streamText({
    model: google("gemini-2.5-pro"),
    onFinish: ({ text }) => onFinish(text),
    messages: promptConfig.messages,
    maxRetries: 4,
    system: promptConfig.system,
  })
}

export async function generateAiQuestionText({
  jobInfo,
  previousQuestions,
  difficulty,
}: {
  jobInfo: QuestionJobInfo
  previousQuestions: PreviousQuestion[]
  difficulty: QuestionDifficulty
}) {
  const promptConfig = getQuestionPromptConfig({
    jobInfo,
    previousQuestions,
    difficulty,
  })

  const finalUserMessage = promptConfig.messages[promptConfig.messages.length - 1]
  const messageContent =
    typeof finalUserMessage?.content === "string"
      ? finalUserMessage.content
      : JSON.stringify(finalUserMessage?.content ?? difficulty)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const text = await GroqResponse({
        modelName: GROQ_QUESTION_MODEL,
        message: messageContent,
        systemPrompt: promptConfig.system,
      })

      const trimmedText = text.trim()
      if (trimmedText.length > 0) return trimmedText
    } catch (error) {
      // Quota/rate-limit errors can persist for minutes; fallback immediately.
      if (isQuotaOrRateLimitError(error)) {
        return getFallbackQuestion(difficulty)
      }

      if (attempt === MAX_ATTEMPTS - 1) {
        return getFallbackQuestion(difficulty)
      }
    }
  }

  return getFallbackQuestion(difficulty)
}

export function generateAiQuestionFeedback({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return streamText({
    model: google("gemini-2.5-flash"),
    prompt: answer,
    maxRetries: 4,
    system: getFeedbackSystemPrompt(question),
  })
}

function getFeedbackSystemPrompt(question: string) {
  return `You are an expert technical interviewer. Your job is to evaluate the candidate's answer to a technical interview question.

The original question was:
\`\`\`
${question}
\`\`\`

Instructions:
- Review the candidate's answer (provided in the user prompt).
- Assign a rating from **1 to 10**, where:
  - 10 = Perfect, complete, and well-articulated
  - 7-9 = Mostly correct, with minor issues or room for optimization
  - 4-6 = Partially correct or incomplete
  - 1-3 = Largely incorrect or missing the point
- Provide **concise, constructive feedback** on what was done well and what could be improved.
- Be honest but professional.
- Include a full correct answer in the output. Do not use this answer as part of the grading. Only look at the candidate's response when assigning a rating.
- Try to generate a concise answer where possible, but do not sacrifice quality for brevity.
- Refer to the candidate as "you" in your feedback. This feedback should be written as if you were speaking directly to the interviewee.
- Stop generating output as soon you have provided the rating, feedback, and full correct answer.

Output Format (strictly follow this structure):
\`\`\`
## Feedback (Rating: <Your rating from 1 to 10>/10)
<Your written feedback as markdown>
---
## Correct Answer
<The full correct answer as markdown>
\`\`\``
}

export async function generateAiQuestionFeedbackText({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  const fallbackFeedback = `## Feedback (Rating: N/A)\n\nDue to API rate limits, we cannot provide an automatic evaluation right now. Please review your answer manually against standard practices.\n\n---\n## Correct Answer\n\nA strong answer should directly address the core technical challenge, discuss relevant trade-offs, and outline practical implementation steps.`

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: answer,
        system: getFeedbackSystemPrompt(question),
        maxRetries: 1,
      })

      const trimmedText = text.trim()
      if (trimmedText.length > 0) return trimmedText
    } catch (error) {
      if (isQuotaOrRateLimitError(error)) {
        return fallbackFeedback
      }

      if (attempt === MAX_ATTEMPTS - 1) {
        return fallbackFeedback
      }
    }
  }

  return fallbackFeedback
}