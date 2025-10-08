import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date string to a localized date format.
 * Returns null for invalid dates, allowing components to handle fallbacks.
 * 
 * @param dateString - The date string to format (can be null/undefined)
 * @param locale - The locale to use (defaults to user's browser locale)
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or null if invalid
 */
export function formatDate(
  dateString: string | null | undefined,
  locale?: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string | null {
  if (!dateString?.trim()) return null;
  
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (!isFinite(date.getTime())) {
    return null;
  }
  
  // Use provided locale, or fall back to browser locale, or finally to 'en-US'
  const resolvedLocale = locale || 
    (typeof navigator !== 'undefined' ? navigator.language : undefined) || 
    'en-US';
  
  try {
    return date.toLocaleDateString(resolvedLocale, options);
  } catch (error) {
    // Fallback to en-US if the provided locale is invalid
    console.warn(`Invalid locale "${resolvedLocale}", falling back to en-US`, error);
    return date.toLocaleDateString('en-US', options);
  }
}
