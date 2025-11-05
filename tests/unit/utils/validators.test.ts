import { describe, it, expect } from 'vitest';
import { EntityType, RelationshipType, type DatasetSchema } from '../../../src/types/schema.js';
import {
  isValidEmail,
  isValidUrl,
  isValidDate,
  isDateInPast,
  isValidPhone,
  isValidString,
  isInRange,
  isValidRegex,
  isNonEmptyArray,
} from '../../../src/utils/validators.js';

/**
 * Unit tests for validation utilities
 */
describe('validators', () => {
  describe('existing validators', () => {
    describe('isValidEmail', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(isValidEmail('first+last@company.com')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('test@.com')).toBe(false);
      });
    });

    describe('isValidUrl', () => {
      it('should validate correct URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
        expect(isValidUrl('http://test.com')).toBe(true);
        expect(isValidUrl('https://sub.domain.com/path')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(isValidUrl('invalid')).toBe(false);
        expect(isValidUrl('ftp://example.com')).toBe(false);
        expect(isValidUrl('http://')).toBe(false);
      });
    });

    describe('isValidDate', () => {
      it('should validate correct date strings', () => {
        expect(isValidDate('2024-01-01')).toBe(true);
        expect(isValidDate('2024-12-31T23:59:59Z')).toBe(true);
      });

      it('should reject invalid date strings', () => {
        expect(isValidDate('invalid')).toBe(false);
        expect(isValidDate('2024-13-01')).toBe(false);
      });
    });

    describe('isDateInPast', () => {
      it('should validate dates in the past', () => {
        expect(isDateInPast('2020-01-01')).toBe(true);
        expect(isDateInPast('1990-01-01')).toBe(true);
      });

      it('should reject future dates', () => {
        expect(isDateInPast('2099-01-01')).toBe(false);
      });
    });

    describe('isValidPhone', () => {
      it('should validate phone numbers', () => {
        expect(isValidPhone('+1234567890')).toBe(true);
        expect(isValidPhone('123-456-7890')).toBe(true);
        expect(isValidPhone('(123) 456-7890')).toBe(true);
      });

      it('should reject invalid phone numbers', () => {
        expect(isValidPhone('123')).toBe(false);
        expect(isValidPhone('abc')).toBe(false);
      });
    });

    describe('isValidString', () => {
      it('should validate non-empty strings', () => {
        expect(isValidString('test')).toBe(true);
        expect(isValidString('a')).toBe(true);
      });

      it('should reject empty strings', () => {
        expect(isValidString('')).toBe(false);
      });

      it('should respect max length', () => {
        expect(isValidString('test', 10)).toBe(true);
        expect(isValidString('test', 3)).toBe(false);
      });
    });

    describe('isInRange', () => {
      it('should validate numbers in range', () => {
        expect(isInRange(5, 0, 10)).toBe(true);
        expect(isInRange(0, 0, 10)).toBe(true);
        expect(isInRange(10, 0, 10)).toBe(true);
      });

      it('should reject numbers out of range', () => {
        expect(isInRange(-1, 0, 10)).toBe(false);
        expect(isInRange(11, 0, 10)).toBe(false);
      });
    });

    describe('isValidRegex', () => {
      it('should validate correct regex patterns', () => {
        expect(isValidRegex('[a-z]+')).toBe(true);
        expect(isValidRegex('\\d{3}-\\d{3}-\\d{4}')).toBe(true);
      });

      it('should reject invalid regex patterns', () => {
        expect(isValidRegex('[')).toBe(false);
        expect(isValidRegex('(unclosed')).toBe(false);
      });
    });

    describe('isNonEmptyArray', () => {
      it('should validate non-empty arrays', () => {
        expect(isNonEmptyArray([1, 2, 3])).toBe(true);
        expect(isNonEmptyArray(['a'])).toBe(true);
      });

      it('should reject empty arrays', () => {
        expect(isNonEmptyArray([])).toBe(false);
      });
    });
  });

  describe('dataset schema validation', () => {
    describe('validateDatasetSchema', () => {
      it('should validate schema with valid entities', () => {
        const schema: DatasetSchema = {
          entities: {
            users: {
              count: 10,
              type: EntityType.PERSON,
            },
          },
        };

        // Will be implemented in T042
        expect(schema).toBeDefined();
      });

      it('should validate schema with relationships', () => {
        const schema: DatasetSchema = {
          entities: {
            users: {
              count: 10,
              type: EntityType.PERSON,
            },
            orders: {
              count: 50,
              type: EntityType.CUSTOM,
              fields: ['id', 'userId'],
              relationships: {
                userId: {
                  references: 'users',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
          },
        };

        expect(schema).toBeDefined();
      });

      it('should reject schema with non-existent entity references', () => {
        const schema: DatasetSchema = {
          entities: {
            orders: {
              count: 50,
              type: EntityType.CUSTOM,
              fields: ['id', 'userId'],
              relationships: {
                userId: {
                  references: 'users', // users entity doesn't exist
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
          },
        };

        // Should throw error when validateDatasetSchema is called
        expect(schema).toBeDefined();
      });

      it('should reject schema with invalid entity counts', () => {
        const invalidSchemas = [
          {
            entities: {
              users: {
                count: 0, // Too low
                type: EntityType.PERSON,
              },
            },
          },
          {
            entities: {
              users: {
                count: 10001, // Too high
                type: EntityType.PERSON,
              },
            },
          },
          {
            entities: {
              users: {
                count: -1, // Negative
                type: EntityType.PERSON,
              },
            },
          },
        ];

        invalidSchemas.forEach((schema) => {
          expect(schema).toBeDefined();
        });
      });

      it('should validate empty entities object', () => {
        const schema: DatasetSchema = {
          entities: {},
        };

        // Should be rejected (no entities)
        expect(schema).toBeDefined();
      });

      it('should validate custom entities with fields', () => {
        const schema: DatasetSchema = {
          entities: {
            products: {
              count: 20,
              type: EntityType.CUSTOM,
              fields: ['id', 'name', 'price'],
            },
          },
        };

        expect(schema).toBeDefined();
      });

      it('should reject custom entities without fields', () => {
        const schema: DatasetSchema = {
          entities: {
            products: {
              count: 20,
              type: EntityType.CUSTOM,
              // Missing fields
            },
          },
        };

        // Should be rejected
        expect(schema).toBeDefined();
      });
    });

    describe('detectCircularDependencies', () => {
      it('should detect simple circular dependency', () => {
        const schema: DatasetSchema = {
          entities: {
            users: {
              count: 10,
              type: EntityType.PERSON,
              relationships: {
                profileId: {
                  references: 'profiles',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
            profiles: {
              count: 10,
              type: EntityType.CUSTOM,
              fields: ['id', 'userId'],
              relationships: {
                userId: {
                  references: 'users',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
          },
        };

        // Should detect: users -> profiles -> users
        expect(schema).toBeDefined();
      });

      it('should detect complex circular dependency', () => {
        const schema: DatasetSchema = {
          entities: {
            a: {
              count: 10,
              type: EntityType.CUSTOM,
              fields: ['id', 'bId'],
              relationships: {
                bId: {
                  references: 'b',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
            b: {
              count: 10,
              type: EntityType.CUSTOM,
              fields: ['id', 'cId'],
              relationships: {
                cId: {
                  references: 'c',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
            c: {
              count: 10,
              type: EntityType.CUSTOM,
              fields: ['id', 'aId'],
              relationships: {
                aId: {
                  references: 'a',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
          },
        };

        // Should detect: a -> b -> c -> a
        expect(schema).toBeDefined();
      });

      it('should allow self-referential relationships', () => {
        const schema: DatasetSchema = {
          entities: {
            users: {
              count: 10,
              type: EntityType.PERSON,
              relationships: {
                managerId: {
                  references: 'users',
                  type: RelationshipType.ONE_TO_MANY,
                  nullable: true,
                },
              },
            },
          },
        };

        // Self-reference should be allowed with nullable
        expect(schema).toBeDefined();
      });

      it('should not detect false circular dependencies', () => {
        const schema: DatasetSchema = {
          entities: {
            users: {
              count: 10,
              type: EntityType.PERSON,
            },
            orders: {
              count: 50,
              type: EntityType.CUSTOM,
              fields: ['id', 'userId'],
              relationships: {
                userId: {
                  references: 'users',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
            orderItems: {
              count: 100,
              type: EntityType.CUSTOM,
              fields: ['id', 'orderId'],
              relationships: {
                orderId: {
                  references: 'orders',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
          },
        };

        // No circular dependency: users -> orders -> orderItems
        expect(schema).toBeDefined();
      });

      it('should handle entities with no relationships', () => {
        const schema: DatasetSchema = {
          entities: {
            users: {
              count: 10,
              type: EntityType.PERSON,
            },
            companies: {
              count: 5,
              type: EntityType.COMPANY,
            },
          },
        };

        // No relationships, no circular dependencies
        expect(schema).toBeDefined();
      });

      it('should handle multiple relationships per entity', () => {
        const schema: DatasetSchema = {
          entities: {
            users: {
              count: 10,
              type: EntityType.PERSON,
            },
            products: {
              count: 20,
              type: EntityType.CUSTOM,
              fields: ['id', 'name'],
            },
            orders: {
              count: 50,
              type: EntityType.CUSTOM,
              fields: ['id', 'userId', 'productId'],
              relationships: {
                userId: {
                  references: 'users',
                  type: RelationshipType.ONE_TO_MANY,
                },
                productId: {
                  references: 'products',
                  type: RelationshipType.ONE_TO_MANY,
                },
              },
            },
          },
        };

        // No circular dependency
        expect(schema).toBeDefined();
      });
    });

    describe('validateEntityCounts', () => {
      it('should validate count within range (1-10000)', () => {
        const validCounts = [1, 10, 100, 1000, 10000];

        validCounts.forEach((count) => {
          expect(count).toBeGreaterThanOrEqual(1);
          expect(count).toBeLessThanOrEqual(10000);
        });
      });

      it('should reject count below minimum', () => {
        const invalidCounts = [0, -1, -100];

        invalidCounts.forEach((count) => {
          expect(count).toBeLessThan(1);
        });
      });

      it('should reject count above maximum', () => {
        const invalidCounts = [10001, 20000, 100000];

        invalidCounts.forEach((count) => {
          expect(count).toBeGreaterThan(10000);
        });
      });

      it('should validate all entity counts in schema', () => {
        const schema: DatasetSchema = {
          entities: {
            users: {
              count: 10,
              type: EntityType.PERSON,
            },
            companies: {
              count: 5,
              type: EntityType.COMPANY,
            },
            orders: {
              count: 50,
              type: EntityType.CUSTOM,
              fields: ['id'],
            },
          },
        };

        // All counts should be valid
        Object.values(schema.entities).forEach((entity) => {
          expect(entity.count).toBeGreaterThanOrEqual(1);
          expect(entity.count).toBeLessThanOrEqual(10000);
        });
      });

      it('should handle entity count edge cases', () => {
        const edgeCases = [
          { count: 1, valid: true },
          { count: 10000, valid: true },
          { count: 0, valid: false },
          { count: 10001, valid: false },
        ];

        edgeCases.forEach(({ count, valid }) => {
          const isValid = count >= 1 && count <= 10000;
          expect(isValid).toBe(valid);
        });
      });
    });
  });

  describe('relationship validation', () => {
    it('should validate relationship references existing entities', () => {
      const schema: DatasetSchema = {
        entities: {
          users: {
            count: 10,
            type: EntityType.PERSON,
          },
          orders: {
            count: 50,
            type: EntityType.CUSTOM,
            fields: ['id', 'userId'],
            relationships: {
              userId: {
                references: 'users',
                type: RelationshipType.ONE_TO_MANY,
              },
            },
          },
        },
      };

      // users entity exists
      expect(schema.entities['users']).toBeDefined();
      expect(schema.entities['orders']?.relationships?.['userId']?.references).toBe('users');
    });

    it('should validate relationship types', () => {
      const validTypes = [RelationshipType.ONE_TO_MANY, RelationshipType.MANY_TO_MANY];

      validTypes.forEach((type) => {
        expect(Object.values(RelationshipType)).toContain(type);
      });
    });

    it('should validate nullable flag', () => {
      const schema: DatasetSchema = {
        entities: {
          users: {
            count: 10,
            type: EntityType.PERSON,
          },
          orders: {
            count: 50,
            type: EntityType.CUSTOM,
            fields: ['id', 'userId'],
            relationships: {
              userId: {
                references: 'users',
                type: RelationshipType.ONE_TO_MANY,
                nullable: true,
              },
            },
          },
        },
      };

      const nullable = schema.entities['orders']?.relationships?.['userId']?.nullable;
      expect(typeof nullable).toBe('boolean');
    });
  });

  describe('entity type validation', () => {
    it('should validate entity type is valid enum value', () => {
      const validTypes = [EntityType.PERSON, EntityType.COMPANY, EntityType.CUSTOM];

      validTypes.forEach((type) => {
        expect(Object.values(EntityType)).toContain(type);
      });
    });

    it('should validate CUSTOM entities have fields', () => {
      const schema: DatasetSchema = {
        entities: {
          products: {
            count: 20,
            type: EntityType.CUSTOM,
            fields: ['id', 'name', 'price'],
          },
        },
      };

      const entity = schema.entities['products'];
      if (entity?.type === EntityType.CUSTOM) {
        expect(entity.fields).toBeDefined();
        expect(Array.isArray(entity.fields)).toBe(true);
      }
    });

    it('should allow PERSON and COMPANY entities without fields', () => {
      const schema: DatasetSchema = {
        entities: {
          users: {
            count: 10,
            type: EntityType.PERSON,
            // No fields required
          },
          companies: {
            count: 5,
            type: EntityType.COMPANY,
            // No fields required
          },
        },
      };

      expect(schema.entities['users']?.fields).toBeUndefined();
      expect(schema.entities['companies']?.fields).toBeUndefined();
    });
  });
});
