import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";
export const env = createEnv({
  server: {
    DB_HOST: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
  },
  createFinalSchema: env =>{
    return z.object(env).transform(val=>{
      const {DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, ...rest} = val
      return {
        ...rest,
        DATABASE_URL: `postgresql://${val.DB_USER}:${val.DB_PASSWORD}@${val.DB_HOST}/${val.DB_NAME}`,
      }
    })
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv : process.env,
});
