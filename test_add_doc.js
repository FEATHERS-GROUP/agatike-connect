import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { config } from "dotenv";

config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAddDoc() {
  try {
    const newDoc = await addDoc(collection(db, "agatike_channels"), {
      test: true
    });
    console.log("Successfully added doc:", newDoc.id);
  } catch (error) {
    console.error("Error adding doc:", error);
  }
  process.exit(0);
}

testAddDoc();
