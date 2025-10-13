
'use client';

import React, { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

interface FirebaseContextType {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  firestore: null,
  storage: null,
});

export function FirebaseProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FirebaseContextType;
}) {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseApp = () => {
  const { app } = useFirebase();
  if (!app) {
    throw new Error('Firebase app not available in context. Make sure you are using FirebaseProvider.');
  }
  return app;
};

export const useFirestore = () => {
    const { firestore } = useFirebase();
    if (firestore === undefined) {
        throw new Error('Firestore not available in context. Make sure you are using FirebaseProvider.');
    }
    return firestore;
}

export const useStorage = () => {
  const { storage } = useFirebase();
  if (storage === undefined) {
      throw new Error('Firebase Storage not available in context. Make sure you are using FirebaseProvider.');
  }
  return storage;
}
