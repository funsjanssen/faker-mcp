import { Faker, en } from '@faker-js/faker';
import { expect } from 'vitest';

/**
 * Creates a seeded Faker instance for testing
 */
export function createTestFaker(seed = 12345): Faker {
  const faker = new Faker({ locale: en });
  faker.seed(seed);
  return faker;
}

/**
 * Custom assertion helpers for generated data
 */
export const assertions = {
  /**
   * Assert that a value is a valid email
   */
  toBeValidEmail(email: string): void {
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  },

  /**
   * Assert that a value is a valid URL
   */
  toBeValidUrl(url: string): void {
    expect(url).toMatch(/^https?:\/\/.+\..+$/);
  },

  /**
   * Assert that a value is a non-empty string
   */
  toBeNonEmptyString(value: string): void {
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  },

  /**
   * Assert that generated IDs are unique
   */
  toHaveUniqueIds(records: Array<{ id: string }>): void {
    const ids = records.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  },
};

/**
 * Mock MCP request helper
 */
export function createMockToolRequest(toolName: string, args: Record<string, unknown>) {
  return {
    method: 'tools/call' as const,
    params: {
      name: toolName,
      arguments: args,
    },
  };
}

/**
 * Test data factories
 */
export const factories = {
  /**
   * Create test person request params
   */
  personRequest(overrides: Record<string, unknown> = {}) {
    return {
      count: 10,
      locale: 'en',
      seed: 12345,
      includeAddress: true,
      includePhone: true,
      ...overrides,
    };
  },

  /**
   * Create test company request params
   */
  companyRequest(overrides: Record<string, unknown> = {}) {
    return {
      count: 5,
      locale: 'en',
      seed: 54321,
      includeAddress: true,
      includeWebsite: true,
      ...overrides,
    };
  },

  /**
   * Create test dataset schema
   */
  datasetSchema() {
    return {
      entities: {
        users: {
          count: 10,
          type: 'person' as const,
          fields: ['id', 'fullName', 'email'],
        },
        orders: {
          count: 30,
          type: 'custom' as const,
          fields: ['id', 'userId', 'productName', 'price'],
          relationships: {
            userId: {
              references: 'users',
              type: 'one-to-many' as const,
            },
          },
        },
      },
    };
  },
};
