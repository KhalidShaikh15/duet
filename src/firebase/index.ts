
'use client';

import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

import { useFirebaseApp, useFirestore, useStorage, FirebaseProvider } from './provider';
import { useDoc } from './firestore/use-doc';
import { useCollection } from './firestore/use-collection';
import { useMemoFirebase } from './memo';
import { FirebaseClientProvider } from './client-provider';

function initializeFirebase(config: FirebaseOptions) {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApp() : initializeApp(config);
  const firestore = getFirestore(app);

  if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST;
    if (!isInitialized) {
        connectFirestoreEmulator(firestore, host, 8080);
    }
  }

  return { app, auth: null, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useDoc,
  useCollection,
  useFirebaseApp,
  useFirestore,
  useStorage,
  useMemoFirebase,
};
