import { createServerFn } from "@tanstack/react-start";
import admin from "firebase-admin";
import { hasuraRequest } from "./graphql.server";

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
  try {
    // If you have a service account JSON, you would load it here.
    // We assume the environment has GOOGLE_APPLICATION_CREDENTIALS set, or you provide cert variables.
    // For local development without service account, this will log a warning or use default.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.warn("Firebase Admin Initialization Warning:", error);
  }
}

export const sendPushNotification = createServerFn({ method: "POST" })
  .inputValidator((d: { userIds: string[]; title: string; body: string; data?: any }) => d)
  .handler(async (ctx) => {
    const { userIds, title, body, data } = ctx.data as any;

    if (!userIds || userIds.length === 0) {
      return { success: false, error: "No userIds provided" };
    }

    try {
      // Fetch user profiles to extract FCM tokens
      const query = `
        query GetUserTokens($ids: [uuid!]!) {
          users(where: {id: {_in: $ids}}) {
            id
            profile
          }
        }
      `;
      const result = await hasuraRequest<{ users: any[] }>(query, { ids: userIds });
      
      const tokens: string[] = [];
      result?.users?.forEach(user => {
        const profile = typeof user.profile === "string" ? JSON.parse(user.profile) : user.profile;
        if (profile?.fcm_tokens && Array.isArray(profile.fcm_tokens)) {
          tokens.push(...profile.fcm_tokens);
        }
      });

      if (tokens.length === 0) {
        return { success: false, error: "No FCM tokens found for provided users" };
      }

      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Clean up invalid tokens if needed
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      return { 
        success: true, 
        successCount: response.successCount, 
        failureCount: response.failureCount,
        failedTokens 
      };
    } catch (error: any) {
      console.error("Error sending push notification:", error);
      return { success: false, error: error.message };
    }
  });
