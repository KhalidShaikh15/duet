
'use client';

import React, { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
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


export const useAuth = () => {
    const { auth } = useFirebase();
    if (auth === undefined) {
      throw new Error('Auth not available in context. Make sure you are using FirebaseProvider.');
    }
    return auth;
}

export const useFirestore = () => {
    const { firestore } = useFirebase();
    if (firestore === undefined) {
        throw new Error('Firestore not available in context. Make sure you are using FirebaseProvider.');
    }
    return firestore;
}
