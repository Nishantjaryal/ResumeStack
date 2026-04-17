"use client"

import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  JobInfoTable,
  questionDifficulties,
  QuestionDifficulty,
} from "@/drizzle/schema"
import { formatQuestionDifficulty } from "@/features/questions/formatters"
import { useRef, useState } from "react"
import { useCompletion } from "@ai-sdk/react"
import { toast } from "sonner"
import BackLink from "@/components/BackLink"

type Status = "awaiting-answer" | "awaiting-difficulty" | "init"

export function NewQuestionClientPage({
  jobInfo,
}: {
  jobInfo: Pick<typeof JobInfoTable.$inferSelect, "id" | "name" | "jobTitle">
}) {
  const [status, setStatus] = useState<Status>("init")
  const [answer, setAnswer] = useState<string | null>(null)
  const lastDifficultyRef = useRef<QuestionDifficulty | null>(null)
  const emptyRetryRef = useRef(0)

  const {
    complete: generateQuestion,
    completion: question,
    setCompletion: setQuestion,
    isLoading: isGeneratingQuestion,
  } = useCompletion({
    api: "/api/ai/questions/generate-question",
    onFinish: (_prompt, generatedQuestion) => {
      if (generatedQuestion.trim().length === 0) {
        if (emptyRetryRef.current < 1 && lastDifficultyRef.current != null) {
          emptyRetryRef.current += 1
          generateQuestion(lastDifficultyRef.current, {
            body: { jobInfoId: jobInfo.id },
          })
          return
        }

        setStatus("init")
        emptyRetryRef.current = 0
        toast("Question generation returned empty output. Please try again.")
        return
      }

      emptyRetryRef.current = 0
      setStatus("awaiting-answer")
    },
    onError: error => {
      setStatus("init")
      emptyRetryRef.current = 0
      toast(error.message)
    },
  })

  const {
    complete: generateFeedback,
    completion: feedback,
    setCompletion: setFeedback,
    isLoading: isGeneratingFeedback,
  } = useCompletion({
    api: "/api/ai/questions/generate-feedback",
    onFinish: () => {
      setStatus("awaiting-difficulty")
    },
    onError: error => {
      toast(error.message)
    },
  })

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[2000px] mx-auto grow h-full">
      <div className="container flex gap-4 mt-4 items-center justify-between">
        <div className="grow basis-0">
          <BackLink takeTo={`/app/job-info/${jobInfo.id}`} Text="Back" />
            
        </div>
        <Controls
          reset={() => {
            setStatus("init")
            setQuestion("")
            setFeedback("")
            setAnswer(null)
          }}
          disableAnswerButton={answer == null || answer.trim() === ""}
          status={status}
          isLoading={isGeneratingFeedback || isGeneratingQuestion}
          generateFeedback={() => {
            if (answer == null || answer.trim() === "") return
            if (question.trim().length === 0) return

            generateFeedback(answer.trim(), { body: { question } })
          }}
          generateQuestion={difficulty => {
            setStatus("init")
            lastDifficultyRef.current = difficulty
            emptyRetryRef.current = 0
            setQuestion("")
            setFeedback("")
            setAnswer(null)
            generateQuestion(difficulty, { body: { jobInfoId: jobInfo.id } })
          }}
        />
        <div className="grow hidden md:block" />
      </div>
      <QuestionContainer
        question={question}
        feedback={feedback}
        answer={answer}
        status={status}
        isGeneratingQuestion={isGeneratingQuestion}
        setAnswer={setAnswer}
      />
    </div>
  )
}

function QuestionContainer({
  question,
  feedback,
  answer,
  status,
  isGeneratingQuestion,
  setAnswer,
}: {
  question: string
  feedback: string
  answer: string | null
  status: Status
  isGeneratingQuestion: boolean
  setAnswer: (value: string) => void
}) {
  const hasQuestion = question.trim().length > 0

  return (
    <ResizablePanelGroup orientation="horizontal" className="grow border-t">
      <ResizablePanel id="question-and-feedback" defaultSize={50} minSize={5}>
        <ResizablePanelGroup orientation="vertical" className="grow">
          <ResizablePanel id="question" defaultSize={25} minSize={5}>
            <ScrollArea className="h-full min-w-48 *:h-full">
              {!hasQuestion ? (
                <p className="text-base md:text-lg flex items-center justify-center h-full p-6">
                  {isGeneratingQuestion
                    ? "Generating your question..."
                    : "Get started by selecting a question difficulty above."}
                </p>
              ) : (
                hasQuestion && (
                  <MarkdownRenderer className="p-6">
                    {question}
                  </MarkdownRenderer>
                )
              )}
            </ScrollArea>
          </ResizablePanel>
          {feedback.trim().length > 0 && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel id="feedback" defaultSize={75} minSize={5}>
                <ScrollArea className="h-full min-w-48 *:h-full">
                  <MarkdownRenderer className="p-6">
                    {feedback}
                  </MarkdownRenderer>
                </ScrollArea>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="answer" defaultSize={50} minSize={5}>
        <ScrollArea className="h-full min-w-48 *:h-full">
          <Textarea
            disabled={status !== "awaiting-answer"}
            onChange={e => setAnswer(e.target.value)}
            value={answer ?? ""}
            placeholder="Type your answer here..."
            className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset text-base! p-6"
          />
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function Controls({
  status,
  isLoading,
  disableAnswerButton,
  generateQuestion,
  generateFeedback,
  reset,
}: {
  disableAnswerButton: boolean
  status: Status
  isLoading: boolean
  generateQuestion: (difficulty: QuestionDifficulty) => void
  generateFeedback: () => void
  reset: () => void
}) {
  return (
    <div className="flex gap-2">
      {status === "awaiting-answer" ? (
        <>
          <Button
            onClick={reset}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Skip</LoadingSwap>
          </Button>
          <Button
            onClick={generateFeedback}
            disabled={disableAnswerButton}
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap>
          </Button>
        </>
      ) : (
        questionDifficulties.map(difficulty => (
          <Button
            key={difficulty}
            size="sm"
            disabled={isLoading}
            onClick={() => generateQuestion(difficulty)}
          >
            <LoadingSwap isLoading={isLoading}>
              {formatQuestionDifficulty(difficulty)}
            </LoadingSwap>
          </Button>
        ))
      )}
    </div>
  )
}