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
import { generateAiQuestion } from "@/services/ai/questions"
import { getCurrentUser } from "@/services/clerk/getCurrentUser"
import { and, asc, eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import z from "zod"

const schema = z.object({
  prompt: z.enum(questionDifficulties),
  jobInfoId: z.string().min(1),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsedBody = schema.safeParse(body)

  if (!parsedBody.success) {
    return new Response("Error generating your question", { status: 400 })
  }

  const { prompt: difficulty, jobInfoId } = parsedBody.data
  const { userId } = await getCurrentUser()

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 })
  }

  if (!(await canCreateQuestion())) {
    return new Response("You have reached your question limit", { status: 403 })
  }

  const jobInfo = await getJobInfo(jobInfoId, userId)
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    })
  }



  const previousQuestions = await getQuestions(jobInfoId)

  const generation = generateAiQuestion({
    previousQuestions,
    jobInfo,
    difficulty,
    onFinish: async question => {
      await insertQuestion({
        text: question,
        jobInfoId,
        difficulty,
      })
    },
  })

  return generation.toTextStreamResponse()
}

async function getQuestions(jobInfoId: string) {
  "use cache"
  cacheTag(getQuestionsUserTag(jobInfoId))

  return db.query.QuestionTable.findMany({
    where: eq(QuestionTable.jobInfoId, jobInfoId),
    orderBy: asc(QuestionTable.createdAt),
  })
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}