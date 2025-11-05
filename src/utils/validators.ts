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

/**
 * Validates a dataset schema
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
 * Detects circular dependencies in entity relationships
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
 * Validates entity count is within allowed range (1-10000)
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
