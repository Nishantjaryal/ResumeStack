import { QuestionDifficulty } from "@/drizzle/schema";

export function formatQuestionDifficulty(difficulty: QuestionDifficulty): string {
    switch (difficulty) {
        case "easy":
            return "Easy";
        case "medium":
            return "Medium";
        case "hard":
            return "Hard";
        default:
            throw new Error(`Unknown difficulty: ${difficulty}`);
    }
}