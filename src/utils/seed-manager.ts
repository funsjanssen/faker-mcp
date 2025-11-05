import crypto from 'node:crypto';

/**
 * Generates a seed from a string by hashing it
 */
export function hashStringToSeed(str: string): number {
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  // Take first 8 hex characters and convert to number
  const seedNum = parseInt(hash.substring(0, 8), 16);
  // Ensure it's a safe integer
  return seedNum % Number.MAX_SAFE_INTEGER;
}

/**
 * Generates a seed from current timestamp
 */
export function generateTimestampSeed(): number {
  return Date.now() % Number.MAX_SAFE_INTEGER;
}

/**
 * Validates that a seed is a safe integer
 */
export function validateSeed(seed: number): boolean {
  return Number.isSafeInteger(seed) && seed >= 0;
}

/**
 * Gets or generates a seed value
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
 * Derives a child seed from a parent seed and entity name
 * This ensures different entities use different but deterministic seeds
 */
export function deriveChildSeed(parentSeed: number, entityName: string): number {
  const combined = `${parentSeed}_${entityName}`;
  return hashStringToSeed(combined);
}
