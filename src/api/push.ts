import { createServerFn } from "@tanstack/react-start";
import type { MulticastMessage } from "firebase-admin/messaging";
import { hasuraRequest } from "./graphql.server";


export const sendPushNotification = createServerFn({ method: "POST" })
  .validator((d: { userIds: string[]; title: string; body: string; data?: any }) => d)
  .handler(async (ctx) => {
    const { initializeApp, applicationDefault, getApps } = await import(/* @vite-ignore */ "firebase-admin/app");
    const { getMessaging } = await import(/* @vite-ignore */ "firebase-admin/messaging");

    // Initialize Firebase Admin (Only once)
    if (getApps().length === 0) {
      try {
        initializeApp({
          credential: applicationDefault(),
        });
      } catch (error) {
        console.warn("Firebase Admin Initialization Warning:", error);
      }
    }

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
      result?.users?.forEach((user) => {
        const profile = typeof user.profile === "string" ? JSON.parse(user.profile) : user.profile;
        if (profile?.fcm_tokens && Array.isArray(profile.fcm_tokens)) {
          tokens.push(...profile.fcm_tokens);
        }
      });

      if (tokens.length === 0) {
        return { success: false, error: "No FCM tokens found for provided users" };
      }

      const message: MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens: tokens,
        android: {
          priority: "high",
          notification: {
            sound: "default",
          },
        },
        webpush: {
          headers: {
            Urgency: "high",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              contentAvailable: true,
            },
          },
        },
      };

      const response = await getMessaging().sendEachForMulticast(message);

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
        failedTokens,
      };
    } catch (error: any) {
      console.error("Error sending push notification:", error);
      return { success: false, error: error.message };
    }
  });
