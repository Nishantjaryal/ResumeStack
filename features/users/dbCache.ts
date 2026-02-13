import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

// enable caching for user data - this will help to reduce the number of database calls and improve performance

export function getUserIdTag(id: string) {
  return getIdTag("users", id);
}

export function getUserGlobalTag() {
  return getGlobalTag("users");
}

export function reValidateUserCache(id: string) {
  revalidateTag(getUserIdTag(id), "default");
  revalidateTag(getUserGlobalTag(), "default");
}
