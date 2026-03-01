"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { experienceLevels } from "@/drizzle/schema/jobinfo";
import { jobInfoFormSchema } from "../schema";
import { Loader2Icon } from "lucide-react";
import { createJobinfo, updateJobinfo } from "../service/actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type JobInfoFormValues = z.infer<typeof jobInfoFormSchema>;

type JobInfoFormProps = {
  jobinfo?: JobInfoFormValues & { id: string };
};

const Jobinfoform = ({ jobinfo }: JobInfoFormProps) => {
  const form = useForm<JobInfoFormValues>({
    resolver: zodResolver(jobInfoFormSchema),
    defaultValues: {
      name: jobinfo?.name ?? "",
      title: jobinfo?.title ?? null,
      experienceLevel: jobinfo?.experienceLevel ?? "junior",
      description: jobinfo?.description ?? "",
    },
  });

  const onSubmit = async (_values: JobInfoFormValues) => {
    // Handle form submission, e.g., send data to the server

    const action = jobinfo
      ? updateJobinfo.bind(null, jobinfo.id)
      : createJobinfo;

    try {
      await action(_values);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      toast.error("Failed to fetch Info");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Frontend Hiring Profile"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Senior Software Engineer"
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        field.onChange(nextValue === "" ? null : nextValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the role, requirements, and expectations"
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            {" "}
            {form.formState.isSubmitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Save Job"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Jobinfoform;
