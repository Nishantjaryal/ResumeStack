import { getGlobalTag, getIdTag, getJobInfoTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

// enable caching for user data - this will help to reduce the number of database calls and improve performance

export function getQuestionIdTag(id: string) {
  return getIdTag("questions", id);
}

export function getQuestionsUserTag(jobInfoId: string) {
  return getJobInfoTag("questions", jobInfoId);
}

export function getQuestionsGlobalTag() {
  return getGlobalTag("questions");
}

export function reValidateQuestionCache({id,jobInfoId}: {id: string, jobInfoId: string}) {
  revalidateTag(getQuestionIdTag(id), "default");
  revalidateTag(getQuestionsGlobalTag(), "default");
  revalidateTag(getQuestionsUserTag(jobInfoId), "default");
}
