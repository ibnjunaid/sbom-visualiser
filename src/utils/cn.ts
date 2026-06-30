import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts?: string): string {
  if (!ts) return 'N/A';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}
