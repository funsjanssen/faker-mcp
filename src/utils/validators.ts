/**
 * Regular expression for validating email addresses.
 * Checks for basic email format: localpart@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Regular expression for validating URLs.
 * Checks for http:// or https:// protocol with domain and TLD.
 */
const URL_REGEX = /^https?:\/\/.+\..+$/;

/**
 * Validates an email address format using RFC-compliant regex.
 *
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email format is valid, false otherwise
 * @example
 * ```typescript
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid.email'); // false
 * isValidEmail('user@domain'); // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates a URL format, requiring http:// or https:// protocol.
 *
 * @param {string} url - The URL to validate
 * @returns {boolean} True if the URL format is valid, false otherwise
 * @example
 * ```typescript
 * isValidUrl('https://example.com'); // true
 * isValidUrl('http://example.com/path'); // true
 * isValidUrl('example.com'); // false
 * isValidUrl('ftp://example.com'); // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

/**
 * Validates a date string in ISO 8601 format or any parseable date format.
 *
 * @param {string} dateStr - The date string to validate
 * @returns {boolean} True if the date is valid and parseable, false otherwise
 * @example
 * ```typescript
 * isValidDate('2023-01-15'); // true
 * isValidDate('2023-01-15T10:30:00Z'); // true
 * isValidDate('invalid-date'); // false
 * ```
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validates that a date string represents a date in the past.
 * Useful for validating birthdates, historical events, etc.
 *
 * @param {string} dateStr - The date string to validate
 * @returns {boolean} True if the date is valid and in the past, false otherwise
 * @example
 * ```typescript
 * isDateInPast('2020-01-01'); // true
 * isDateInPast('2099-01-01'); // false
 * isDateInPast('invalid-date'); // false
 * ```
 */
export function isDateInPast(dateStr: string): boolean {
  if (!isValidDate(dateStr)) {
    return false;
  }
  return new Date(dateStr) < new Date();
}

/**
 * Validates a phone number format (basic check for digit count).
 * Accepts various international formats with at least 7 digits.
 *
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if the phone number has 7-15 digits, false otherwise
 * @example
 * ```typescript
 * isValidPhone('+1-555-123-4567'); // true
 * isValidPhone('555-1234'); // true
 * isValidPhone('123'); // false (too short)
 * ```
 */
export function isValidPhone(phone: string): boolean {
  // Basic check: at least 7 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validates that a string is non-empty and within maximum length.
 *
 * @param {string} str - The string to validate
 * @param {number} [maxLength=255] - Maximum allowed length (defaults to 255)
 * @returns {boolean} True if the string is non-empty and within length limit, false otherwise
 * @example
 * ```typescript
 * isValidString('hello'); // true
 * isValidString(''); // false
 * isValidString('a'.repeat(300)); // false (exceeds default 255)
 * isValidString('hello', 10); // true
 * ```
 */
export function isValidString(str: string, maxLength = 255): boolean {
  return typeof str === 'string' && str.length > 0 && str.length <= maxLength;
}

/**
 * Validates that a number is within a specified range (inclusive).
 *
 * @param {number} num - The number to validate
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @returns {boolean} True if the number is valid and within range, false otherwise
 * @example
 * ```typescript
 * isInRange(50, 0, 100); // true
 * isInRange(0, 0, 100); // true
 * isInRange(100, 0, 100); // true
 * isInRange(150, 0, 100); // false
 * isInRange(NaN, 0, 100); // false
 * ```
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return typeof num === 'number' && !isNaN(num) && num >= min && num <= max;
}

/**
 * Validates a regular expression pattern string by attempting to compile it.
 *
 * @param {string} pattern - The regex pattern to validate
 * @returns {boolean} True if the pattern is valid regex syntax, false otherwise
 * @example
 * ```typescript
 * isValidRegex('[A-Z]{3}'); // true
 * isValidRegex('\\d{4}'); // true
 * isValidRegex('[invalid'); // false
 * ```
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
 * Validates that an array is non-empty.
 *
 * @template T - Type of array elements
 * @param {T[]} arr - The array to validate
 * @returns {boolean} True if the array exists and has at least one element, false otherwise
 * @example
 * ```typescript
 * isNonEmptyArray([1, 2, 3]); // true
 * isNonEmptyArray([]); // false
 * isNonEmptyArray('not an array'); // false
 * ```
 */
export function isNonEmptyArray<T>(arr: T[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Validates a complete dataset schema for structural correctness and referential integrity.
 * Checks entity counts, field definitions, relationship references, and circular dependencies.
 *
 * @param {Object} schema - The dataset schema to validate
 * @param {Record<string, Object>} schema.entities - Map of entity names to definitions
 * @returns {{ valid: boolean; errors: string[] }} Validation result with list of errors
 * @example
 * ```typescript
 * const schema = {
 *   entities: {
 *     users: { count: 10, type: 'person' },
 *     orders: {
 *       count: 50,
 *       type: 'custom',
 *       fields: ['amount'],
 *       relationships: {
 *         userId: { references: 'users', type: 'one-to-many' }
 *       }
 *     }
 *   }
 * };
 * const result = validateDatasetSchema(schema);
 * if (!result.valid) {
 *   console.error('Schema errors:', result.errors);
 * }
 * ```
 */
export function validateDatasetSchema(schema: {
  entities: Record<
    string,
    {
      count: number;
      type: string;
      fields?: string[];
      relationships?: Record<
        string,
        {
          references: string;
          type: string;
          nullable?: boolean;
        }
      >;
    }
  >;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if entities object is empty
  if (Object.keys(schema.entities).length === 0) {
    errors.push('Schema must contain at least one entity');
    return { valid: false, errors };
  }

  // Validate each entity
  for (const [entityName, entity] of Object.entries(schema.entities)) {
    // Validate entity count
    const countValidation = validateEntityCount(entity.count);
    if (!countValidation.valid) {
      errors.push(`Entity '${entityName}': ${countValidation.error}`);
    }

    // Validate custom entities have fields
    if (entity.type === 'custom' && (!entity.fields || entity.fields.length === 0)) {
      errors.push(`Custom entity '${entityName}' must have fields defined`);
    }

    // Validate relationships reference existing entities
    if (entity.relationships) {
      for (const [fieldName, relationship] of Object.entries(entity.relationships)) {
        if (!schema.entities[relationship.references]) {
          errors.push(
            `Entity '${entityName}' field '${fieldName}' references non-existent entity '${relationship.references}'`
          );
        }
      }
    }
  }

  // Check for circular dependencies
  const circularDeps = detectCircularDependencies(schema);
  if (circularDeps.length > 0) {
    errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detects circular dependencies in entity relationships using depth-first search.
 * Circular dependencies prevent proper entity ordering and must be avoided.
 *
 * @param {Object} schema - The dataset schema to analyze
 * @param {Record<string, Object>} schema.entities - Map of entity names to definitions
 * @returns {string[]} Array of circular dependency paths (empty if none found)
 * @example
 * ```typescript
 * // Circular dependency: orders -> products -> suppliers -> orders
 * const schema = {
 *   entities: {
 *     orders: {
 *       relationships: { productId: { references: 'products' } }
 *     },
 *     products: {
 *       relationships: { supplierId: { references: 'suppliers' } }
 *     },
 *     suppliers: {
 *       relationships: { defaultOrderId: { references: 'orders' } }
 *     }
 *   }
 * };
 * const cycles = detectCircularDependencies(schema);
 * // Returns: ['orders -> products -> suppliers -> orders']
 * ```
 */
export function detectCircularDependencies(schema: {
  entities: Record<
    string,
    {
      relationships?: Record<
        string,
        {
          references: string;
          nullable?: boolean;
        }
      >;
    }
  >;
}): string[] {
  const circularPaths: string[] = [];

  // Build dependency graph
  const graph = new Map<string, string[]>();
  for (const [entityName, entity] of Object.entries(schema.entities)) {
    const dependencies: string[] = [];
    if (entity.relationships) {
      for (const relationship of Object.values(entity.relationships)) {
        // Skip self-references if nullable (allowed)
        if (relationship.references === entityName && relationship.nullable) {
          continue;
        }
        dependencies.push(relationship.references);
      }
    }
    graph.set(entityName, dependencies);
  }

  // Detect cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]): boolean {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path])) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cyclePath = [...path, neighbor];
        circularPaths.push(cyclePath.join(' -> '));
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const entityName of Object.keys(schema.entities)) {
    if (!visited.has(entityName)) {
      dfs(entityName, []);
    }
  }

  return circularPaths;
}

/**
 * Validates that an entity count is within allowed range (1-10000).
 * This limit ensures reasonable memory usage and performance.
 *
 * @param {number} count - The entity count to validate
 * @returns {{ valid: boolean; error?: string }} Validation result with error message if invalid
 * @example
 * ```typescript
 * validateEntityCount(100); // { valid: true }
 * validateEntityCount(0); // { valid: false, error: 'Count must be at least 1' }
 * validateEntityCount(15000); // { valid: false, error: 'Count must not exceed 10000' }
 * validateEntityCount(3.14); // { valid: false, error: 'Count must be an integer' }
 * ```
 */
export function validateEntityCount(count: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(count)) {
    return { valid: false, error: 'Count must be an integer' };
  }

  if (count < 1) {
    return { valid: false, error: 'Count must be at least 1' };
  }

  if (count > 10000) {
    return { valid: false, error: 'Count must not exceed 10000' };
  }

  return { valid: true };
}
