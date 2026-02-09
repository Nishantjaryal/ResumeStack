type CacheTag = "users" | "jobInfo" | "questions" | "interview";

export function getGlobalTag(tag:string){
    return `global:${tag}` as const;
}

export function getUserTag(tag: CacheTag, userId: string){
    return `user:${userId}:${tag}` as const;
}

export function getIdTag(tag: CacheTag, id: string){
    return `id:${id}:${tag}` as const;
}