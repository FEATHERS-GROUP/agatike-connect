import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

let db: ReturnType<typeof getFirestore> | null = null;
let messaging: ReturnType<typeof getMessaging> | null = null;

export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      initializeApp({
        credential: applicationDefault(),
      });
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
