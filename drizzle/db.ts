import { env } from "@/data/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/drizzle/schema";

// initialize drizzle with database url and schema to interact with the database using drizzle orm

export const db = drizzle(env.DATABASE_URL, { schema }); 