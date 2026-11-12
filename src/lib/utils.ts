import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdtQ5KIuKxaQxw_BmHqx685x8NfV4pkJv4wC-c8oDNnGeuqZA/viewform';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
