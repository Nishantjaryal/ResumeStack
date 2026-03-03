import { redirect } from "next/navigation";
import { toast } from "sonner";


export const PLAN_LIMI = "PLAN_LIMIT";
export const RATE_LIMI = "RATE_LIMIT";


export function interviewError(message: string) {
    if(message === PLAN_LIMI){
      const toastID = toast.error("You have reached the limit of interviews you can create with your current plan. Please upgrade to create more interviews.",{
        action: {
          label: "Upgrade Plan",
          onClick: () => {
            toast.dismiss(toastID);
            redirect("/app/upgrade");
          }
        }
      })
    return
    }
        if(message === RATE_LIMI){  
        toast.error("Buddy Slow down! You've hit the rate limit")
        return
    }
    toast.error(message)
}