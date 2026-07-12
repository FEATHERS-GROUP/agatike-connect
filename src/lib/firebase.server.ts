import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

let db: ReturnType<typeof getFirestore> | null = null;
let messaging: ReturnType<typeof getMessaging> | null = null;

export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (projectId && clientEmail && privateKey) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        initializeApp({
          credential: applicationDefault(),
        });
      }
    } catch (error) {
      console.warn("Firebase Admin Initialization Warning:", error);
    }
  }

  if (!db) {
    db = getFirestore();
  }
  if (!messaging) {
    messaging = getMessaging();
  }

  return { db, messaging };
}
