import { getGlobalTag, getIdTag, getJobInfoTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

// enable caching for user data - this will help to reduce the number of database calls and improve performance

export function getInterviewIdTag(id: string) {
  return getIdTag("interview", id);
}

export function getInterviewsUserTag(jobInfoId: string) {
  return getJobInfoTag("interview", jobInfoId);
}

export function getInterviewsGlobalTag() {
  return getGlobalTag("interview");
}

export function reValidateInterviewCache({id,jobInfoId}: {id: string, jobInfoId: string}) {
  revalidateTag(getInterviewIdTag(id), "default");
  revalidateTag(getInterviewsGlobalTag(), "default");
  revalidateTag(getInterviewsUserTag(jobInfoId), "default");
}
