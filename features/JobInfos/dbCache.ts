import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

// enable caching for user data - this will help to reduce the number of database calls and improve performance

export function getJobInfoIdTag(id: string) {
  return getIdTag("jobInfo", id);
}

export function getJobInfosUserTag(userId: string) {
  return getUserTag("jobInfo", userId);
}

export function getJobInfosGlobalTag() {
  return getGlobalTag("jobInfo");
}

export function reValidateJobInfoCache({id,userId}: {id: string, userId: string}) {
  revalidateTag(getJobInfoIdTag(id), "default");
  revalidateTag(getJobInfosGlobalTag(), "default");
  revalidateTag(getJobInfosUserTag(userId), "default");
}
