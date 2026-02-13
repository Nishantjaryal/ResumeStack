import { db } from "@/drizzle/db";
import { UsersTable } from "@/drizzle/schema";
import { getUserIdTag } from "@/features/users/dbCache";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

// return the current user data from db
export async function getCurrentUser({ alldata = false } : {alldata?:boolean} = {}) {
    const {userId, redirectToSignIn} = await auth()

    return {
        userId,
        redirectToSignIn,
        user: alldata && userId!=null ? await getUser(userId) : null
    }
}

// get the user from database , optimised server calls by use caching
async function getUser(userId: string) {

    "use cache"
    cacheTag(getUserIdTag(userId))

    return db.query.UsersTable.findFirst({
        where: eq(UsersTable.id, userId)
    })
}