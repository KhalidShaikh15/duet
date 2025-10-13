
'use client';

import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

import { useFirebaseApp, useAuth, useFirestore, FirebaseProvider } from './provider';
import { useUser } from './auth/use-user';
import { useDoc } from './firestore/use-doc';
import { useCollection } from './firestore/use-collection';
import { useMemoFirebase } from './memo';
import { FirebaseClientProvider } from './client-provider';

function initializeFirebase(config: FirebaseOptions) {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST;
    if (!isInitialized) {
        connectAuthEmulator(auth, `http://${host}:9099`, {
            disableWarnings: true,
        });
        connectFirestoreEmulator(firestore, host, 8080);
    }
  }

  return { app, auth, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useUser,
  useDoc,
  useCollection,
  useFirebaseApp,
  useAuth,
  useFirestore,
  useMemoFirebase,
};
