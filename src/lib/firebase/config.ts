import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDNeyte4z98GNgYSL-d8DJ0ZFd2xMuUpYA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "myapp-157.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "myapp-157",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "myapp-157.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "440064994609",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:440064994609:web:4078905a93475347415410"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
