import crypto from 'node:crypto';

/**
 * Generates a deterministic seed value from a string by hashing it using SHA-256.
 * This allows for reproducible data generation using human-readable seed strings.
 *
 * @param {string} str - The string to hash
 * @returns {number} A numeric seed value derived from the string hash
 * @example
 * ```typescript
 * const seed = hashStringToSeed('my-test-data');
 * console.log(seed); // Always returns the same number for 'my-test-data'
 * ```
 */
export function hashStringToSeed(str: string): number {
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  // Take first 8 hex characters and convert to number
  const seedNum = parseInt(hash.substring(0, 8), 16);
  // Ensure it's a safe integer
  return seedNum % Number.MAX_SAFE_INTEGER;
}

/**
 * Generates a seed value from the current timestamp.
 * Used when no explicit seed is provided to ensure different results on each run.
 *
 * @returns {number} A numeric seed value based on current timestamp
 * @example
 * ```typescript
 * const seed = generateTimestampSeed();
 * console.log(seed); // Different value each time
 * ```
 */
export function generateTimestampSeed(): number {
  return Date.now() % Number.MAX_SAFE_INTEGER;
}

/**
 * Validates that a seed value is a safe integer and non-negative.
 * Safe integers are necessary for consistent behavior across platforms.
 *
 * @param {number} seed - The seed value to validate
 * @returns {boolean} True if the seed is valid, false otherwise
 * @example
 * ```typescript
 * validateSeed(12345); // true
 * validateSeed(-100); // false
 * validateSeed(Number.MAX_SAFE_INTEGER + 1); // false
 * validateSeed(3.14); // false
 * ```
 */
export function validateSeed(seed: number): boolean {
  return Number.isSafeInteger(seed) && seed >= 0;
}

/**
 * Gets or generates a seed value based on provided parameters.
 * Prioritizes explicit numeric seed, then seed string, then auto-generates from timestamp.
 *
 * @param {number} [seed] - Optional explicit numeric seed
 * @param {string} [seedString] - Optional string to hash into a seed
 * @returns {number} A valid seed value
 * @throws {Error} If seed is invalid or seedString is invalid
 * @example
 * ```typescript
 * // Use explicit seed
 * getOrGenerateSeed(12345); // Returns 12345
 *
 * // Use seed string
 * getOrGenerateSeed(undefined, 'my-test'); // Returns hash of 'my-test'
 *
 * // Auto-generate from timestamp
 * getOrGenerateSeed(); // Returns timestamp-based seed
 * ```
 */
export function getOrGenerateSeed(seed?: number, seedString?: string): number {
  if (seed !== undefined) {
    if (!validateSeed(seed)) {
      throw new Error(`Invalid seed: ${seed}. Seed must be a non-negative safe integer.`);
    }
    return seed;
  }

  if (seedString !== undefined) {
    if (typeof seedString !== 'string' || seedString.length === 0) {
      throw new Error('Seed string must be a non-empty string');
    }
    if (seedString.length > 100) {
      throw new Error('Seed string must be 100 characters or less');
    }
    return hashStringToSeed(seedString);
  }

  return generateTimestampSeed();
}

/**
 * Derives a child seed from a parent seed and entity name.
 * This ensures different entities use different but deterministic seeds,
 * maintaining reproducibility while avoiding identical data across entities.
 *
 * @param {number} parentSeed - The parent seed value
 * @param {string} entityName - The entity name to combine with the parent seed
 * @returns {number} A child seed derived from parent seed and entity name
 * @example
 * ```typescript
 * const parentSeed = 12345;
 * const userSeed = deriveChildSeed(parentSeed, 'users');
 * const orderSeed = deriveChildSeed(parentSeed, 'orders');
 * // userSeed and orderSeed are different but deterministic
 * ```
 */
export function deriveChildSeed(parentSeed: number, entityName: string): number {
  const combined = `${parentSeed}_${entityName}`;
  return hashStringToSeed(combined);
}
