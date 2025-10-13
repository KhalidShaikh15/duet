
'use client';

import { useMemo } from 'react';
import { type DocumentReference, type Query } from 'firebase/firestore';

// A hook to memoize Firebase queries and document references.
// This is important because otherwise, the reference would be re-created on every render,
// causing an infinite loop in `useDoc` or `useCollection`.
export function useMemoFirebase<T extends DocumentReference | Query>(
  createQuery: () => T | null,
  deps: any[]
) {
  return useMemo(createQuery, deps);
}
