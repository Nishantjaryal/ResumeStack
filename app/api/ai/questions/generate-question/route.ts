import { createTextStreamResponse } from "ai"
import { db } from "@/drizzle/db"
import {
  JobInfoTable,
  questionDifficulties,
  QuestionTable,
} from "@/drizzle/schema"
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache"
import { getQuestionsUserTag } from "@/features/questions/dbCache"
import { insertQuestion } from "@/features/questions/db"
import { canCreateQuestion } from "@/features/questions/permissions"
import { generateAiQuestionText } from "@/services/ai/questions"
import { getCurrentUser } from "@/services/clerk/getCurrentUser"
import { and, desc, eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import z from "zod"

const schema = z.object({
  prompt: z.enum(questionDifficulties),
  jobInfoId: z.string().min(1),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON payload", { status: 400 })
  }

  const parsedBody = schema.safeParse(body)

  if (!parsedBody.success) {
    return new Response("Error generating your question", { status: 400 })
  }

  const { prompt: difficulty, jobInfoId } = parsedBody.data
  const { userId } = await getCurrentUser()

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 })
  }

  const [hasQuestionCredits, jobInfo] = await Promise.all([
    canCreateQuestion(userId),
    getJobInfo(jobInfoId, userId),
  ])

  if (!hasQuestionCredits) {
    return new Response("You have reached your question limit", { status: 403 })
  }

  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    })
  }



  const previousQuestions = await getQuestions(jobInfoId)

  const question = await generateAiQuestionText({
    previousQuestions,
    jobInfo,
    difficulty,
  })

  if (question.trim().length > 0) {
    await insertQuestion({
      text: question,
      jobInfoId,
      difficulty,
    })
  }

  // ai sdk provides createTextStreamResponse to mock a stream response for plain text when useCompletion expects one
  const textStream = new ReadableStream({
    start(controller) {
      if (question) controller.enqueue(question)
      controller.close()
    },
  })
  return createTextStreamResponse({ textStream })
}

async function getQuestions(jobInfoId: string) {
  "use cache"
  cacheTag(getQuestionsUserTag(jobInfoId))

  return db.query.QuestionTable.findMany({
    columns: {
      text: true,
      difficulty: true,
    },
    where: eq(QuestionTable.jobInfoId, jobInfoId),
    orderBy: desc(QuestionTable.createdAt),
    limit: 8,
  })
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}