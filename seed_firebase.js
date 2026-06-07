import { config } from "dotenv";
config();
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

async function run() {
  const organizerId = "0fa59d30-9e09-43e6-82d3-0ff0c7a883aa";

  try {
    // 1. Create General Channel
    const genDoc = await addDoc(collection(db, "channels"), {
      organizerId,
      name: "General Announcements",
      type: "group",
      entityType: "GLOBAL",
      lastMessage: "Welcome to the official community!",
      lastMessageTime: serverTimestamp(),
      unreadCount: 0,
      online: true,
      avatar: "https://i.pravatar.cc/150?u=general",
      createdAt: serverTimestamp(),
    });
    console.log("Created General Channel:", genDoc.id);

    await addDoc(collection(db, "messages"), {
      channelId: genDoc.id,
      senderId: organizerId,
      text: "Welcome to the official community! We will post all major updates here.",
      timestamp: serverTimestamp(),
    });

    // 2. Create an Event Channel
    const eventDoc = await addDoc(collection(db, "channels"), {
      organizerId,
      name: "Summer Music Festival 2026",
      type: "group",
      entityType: "EVENT",
      lastMessage: "Are there VIP passes left?",
      lastMessageTime: serverTimestamp(),
      unreadCount: 2,
      online: true,
      avatar: "https://i.pravatar.cc/150?u=festival",
      createdAt: serverTimestamp(),
    });
    console.log("Created Event Channel:", eventDoc.id);

    await addDoc(collection(db, "messages"), {
      channelId: eventDoc.id,
      senderId: "1620aa9e-2273-4777-beb7-7bdebd0e1f06",
      text: "Are there VIP passes left?",
      timestamp: serverTimestamp(),
    });

    // 3. Create a 1-on-1 User Support Channel
    const userDoc = await addDoc(collection(db, "channels"), {
      organizerId,
      name: "John Doe (Support)",
      type: "user",
      entityType: "SUPPORT",
      lastMessage: "I need help with my ticket.",
      lastMessageTime: serverTimestamp(),
      unreadCount: 1,
      online: false,
      avatar: "https://i.pravatar.cc/150?u=john",
      createdAt: serverTimestamp(),
    });
    console.log("Created User Channel:", userDoc.id);

    await addDoc(collection(db, "messages"), {
      channelId: userDoc.id,
      senderId: "c1a2dbcd-e9f5-47ad-a9c2-b2b784e9b648",
      text: "I need help with my ticket.",
      timestamp: serverTimestamp(),
    });

    console.log("Firestore Seeding Complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding Firestore:", err);
    process.exit(1);
  }
}

run();
