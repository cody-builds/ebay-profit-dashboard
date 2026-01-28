import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge and conditionally apply CSS classes
 * Combines clsx for conditional classes with Tailwind CSS class merging
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}