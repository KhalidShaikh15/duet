'use client';

import { getStorage } from 'firebase/storage';
import { useFirebaseApp } from './provider';

// This is a simple wrapper to initialize and export storage.
// It's not a hook, so it can be imported in utility files.
let storageInstance: ReturnType<typeof getStorage> | null = null;

export const initializeStorage = (app: ReturnType<typeof useFirebaseApp>) => {
    if (!storageInstance) {
        storageInstance = getStorage(app);
    }
    return storageInstance;
}

// We cannot use the useFirebaseApp() hook here directly at the top level
// because it would violate the rules of hooks. We can use a getter function.
// However, for simplicity and to avoid context issues in non-React files,
// we will export the instance and initialize it from the provider.
export { storageInstance as storage };
