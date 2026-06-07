import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { config } from "dotenv";

config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteMockFirebaseData() {
  // 1. Delete Mock Channels
  const channelsSnap = await getDocs(collection(db, "channels"));
  for (const document of channelsSnap.docs) {
    // If ID is not a UUID (UUIDs have hyphens), it's a mock document
    if (!document.id.includes("-")) {
      console.log(`Deleting mock channel: ${document.id} - ${document.data().name}`);
      await deleteDoc(doc(db, "channels", document.id));
    }
  }

  // 2. Delete Messages belonging to those mock channels
  const msgsSnap = await getDocs(collection(db, "messages"));
  for (const document of msgsSnap.docs) {
    const channelId = document.data().channelId;
    if (channelId && !channelId.includes("-")) {
      console.log(`Deleting mock message: ${document.id}`);
      await deleteDoc(doc(db, "messages", document.id));
    }
  }

  console.log("Cleanup complete!");
  process.exit(0);
}

deleteMockFirebaseData();
