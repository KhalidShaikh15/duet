import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDNeyte4z98GNgYSL-d8DJ0ZFd2xMuUpYA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "myapp-157.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "myapp-157",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "myapp-157.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "440064994609",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:440064994609:web:4078905a93475347415410"
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
} else if (getApps().length) {
    app = getApp();
    db = getFirestore(app);
    storage = getStorage(app);
}

// @ts-ignore
export { app, db, storage };