import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getChatId(user1Uid: string, user2Uid: string) {
    return [user1Uid, user2Uid].sort().join('_');
}
