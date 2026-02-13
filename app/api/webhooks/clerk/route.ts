import { deleteUser, upsertUser } from "@/features/users/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

// web hooks helps to handle events from Clerk - retriving user data which will be saved in our database
export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);

    switch (event.type) {
      // Handle user creation event
      case "user.created":
      case "user.updated":
        // Handle user update event
        const user = event.data;
        // const email = user.email_addresses[0].email_address;
        const email = user.email_addresses.find(
          (e) => e.id === user.primary_email_address_id,
        )?.email_address;

        if (!email) {
          console.error("Primary email address not found for user:", user.id);
          return new Response("Primary email address not found", {
            status: 400,
          });
        }

        await upsertUser({
          id: user.id,
          email,
          imageUrl: user.image_url,
          name: `${user.first_name} ${user.last_name}`,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
        });
        console.log("User upserted:", user.email_addresses);
        break;

      case "user.deleted":
        // Handle user deletion event

        if (!event.data.id) {
          return new Response("User ID not found in event data", {
            status: 400,
          });
        }

        await deleteUser(event.data.id);

        break;
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  return new Response("Webhook received", { status: 200 });
}
