
import { initializeApp, getApps, getApp, setLogLevel } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Enable debug logging in development for clearer permission errors
if (process.env.NODE_ENV === 'development') {
  setLogLevel('debug');
}

const auth = getAuth(app);
const storage = getStorage(app);

// Use a singleton pattern for Firestore to work on both client and server
let db: Firestore;

function getDb() {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}


export { app, auth, getDb, storage };
