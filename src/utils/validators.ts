/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * URL validation regex
 */
const URL_REGEX = /^https?:\/\/.+\..+$/;

/**
 * Validates an email address format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates a URL format
 */
export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

/**
 * Validates a date string (ISO 8601 format)
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validates that a date is in the past
 */
export function isDateInPast(dateStr: string): boolean {
  if (!isValidDate(dateStr)) {
    return false;
  }
  return new Date(dateStr) < new Date();
}

/**
 * Validates a phone number (basic check)
 */
export function isValidPhone(phone: string): boolean {
  // Basic check: at least 7 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validates that a string is non-empty and within max length
 */
export function isValidString(str: string, maxLength = 255): boolean {
  return typeof str === 'string' && str.length > 0 && str.length <= maxLength;
}

/**
 * Validates that a number is within a range
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return typeof num === 'number' && !isNaN(num) && num >= min && num <= max;
}

/**
 * Validates a regex pattern string
 */
export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that an array is non-empty
 */
export function isNonEmptyArray<T>(arr: T[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}
