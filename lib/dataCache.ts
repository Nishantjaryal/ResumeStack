type CacheTag = "users" | "jobInfo" | "questions" | "interview";

// This file contains helper functions to generate cache tags for different entities in the application.

export function getGlobalTag(tag:string){
    return `global:${tag}` as const;
}

export function getUserTag(tag: CacheTag, userId: string){
    return `user:${userId}:${tag}` as const;
}

export function getIdTag(tag: CacheTag, id: string){
    return `id:${id}:${tag}` as const;
}