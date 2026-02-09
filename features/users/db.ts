import { UsersTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";

export async function upsertUser(user: typeof UsersTable.$inferInsert){
    await db.insert(UsersTable).values(user).onConflictDoUpdate({
        target: [UsersTable.id],
        set: user,
    })
} 


export async function deleteUser(id: string) {
    await db.delete(UsersTable).where(eq(UsersTable.id,id)) 
}