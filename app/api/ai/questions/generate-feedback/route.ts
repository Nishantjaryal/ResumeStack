import { createTextStreamResponse } from "ai"
import { db } from "@/drizzle/db"
import { QuestionTable } from "@/drizzle/schema"
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache"
import { getQuestionIdTag } from "@/features/questions/dbCache"
import { generateAiQuestionFeedbackText } from "@/services/ai/questions"
import { getCurrentUser } from "@/services/clerk/getCurrentUser"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import z from "zod"

const schema = z.object({
  prompt: z.string().min(1),
  question: z.string().min(1).optional(),
  questionId: z.string().min(1).optional(),
}).refine(data => data.question != null || data.questionId != null, {
  message: "Either question or questionId is required",
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON payload", { status: 400 })
  }

  const result = schema.safeParse(body)

  if (!result.success) {
    return new Response("Error generating your feedback", { status: 400 })
  }

  const { prompt: answer, question, questionId } = result.data
  const { userId } = await getCurrentUser()

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 })
  }

  let questionText = question

  if (questionText == null && questionId != null) {
    const dbQuestion = await getQuestion(questionId, userId)
    if (dbQuestion == null) {
      return new Response("You do not have permission to do this", {
        status: 403,
      })
    }

    questionText = dbQuestion.text
  }

  if (questionText == null) {
    return new Response("Question is required", { status: 400 })
  }

  const feedback = await generateAiQuestionFeedbackText({
    question: questionText,
    answer,
  })

  const textStream = new ReadableStream({
    start(controller) {
      if (feedback) controller.enqueue(feedback)
      controller.close()
    },
  })
  return createTextStreamResponse({ textStream })
}

async function getQuestion(id: string, userId: string) {
  "use cache"
  cacheTag(getQuestionIdTag(id))

  const question = await db.query.QuestionTable.findFirst({
    where: eq(QuestionTable.id, id),
    with: { jobInfoId: { columns: { id: true, userId: true } } },
  })

  if (question == null) return null
  cacheTag(getJobInfoIdTag(question.jobInfoId.id))

  if (question.jobInfoId.userId !== userId) return null
  return question
}