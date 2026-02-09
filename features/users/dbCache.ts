import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";


export function getUserIdTag(id:string){
    return getIdTag("users", id);
}

export function getUserGlobalTag(){
    return getGlobalTag("users")
}

export function reValidateUserCache(id:string){
    revalidateTag(getUserIdTag(id));
    revalidateTag(getUserGlobalTag());

}