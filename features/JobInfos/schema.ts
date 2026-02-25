import { experienceLevels } from "@/drizzle/schema";
import z from "zod";

export const jobInfoFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().min(1).nullable(),
  experienceLevel: z.enum(experienceLevels, {
    message: "Experience level is required",
  }),
  description: z.string().trim().min(1, "Description is required"),
})