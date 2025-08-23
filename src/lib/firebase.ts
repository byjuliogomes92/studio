
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Defer Firestore initialization to client-side
let db: Firestore | null = null;

function getDb() {
  if (typeof window !== 'undefined' && !db) {
    db = getFirestore(app);
  }
  return db;
}


export { app, auth, getDb };
