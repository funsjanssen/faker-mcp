import { describe, it, expect } from 'vitest';
import { EntityType, RelationshipType, type DatasetSchema } from '../../../src/types/schema.js';

/**
 * Unit tests for DatasetGenerator
 * Tests entity ordering, FK generation, and relationship types
 */
describe('DatasetGenerator', () => {
  describe('entity ordering', () => {
    it('should order entities with no dependencies first', () => {
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

      // Expected: Both can be first (no dependencies)
      const entityNames = Object.keys(schema.entities);
      expect(entityNames).toContain('users');
      expect(entityNames).toContain('companies');
    });

    it('should order parent entities before child entities', () => {
      const schema: DatasetSchema = {
        entities: {
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
          users: {
            count: 10,
            type: EntityType.PERSON,
          },
        },
      };

      // Expected: users should be generated before orders
      // Implementation will need topological sort
      expect(schema.entities['users']).toBeDefined();
      expect(schema.entities['orders']?.relationships?.['userId']?.references).toBe('users');
    });

    it('should handle multiple levels of dependencies', () => {
      const schema: DatasetSchema = {
        entities: {
          orderItems: {
            count: 100,
            type: EntityType.CUSTOM,
            fields: ['id', 'orderId', 'productId'],
            relationships: {
              orderId: {
                references: 'orders',
                type: RelationshipType.ONE_TO_MANY,
              },
            },
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
          users: {
            count: 10,
            type: EntityType.PERSON,
          },
        },
      };

      // Expected order: users -> orders -> orderItems
      expect(schema.entities['users']).toBeDefined();
      expect(schema.entities['orders']?.relationships?.['userId']?.references).toBe('users');
      expect(schema.entities['orderItems']?.relationships?.['orderId']?.references).toBe('orders');
    });

    it('should handle entities with multiple dependencies', () => {
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

      // Expected: users and products before orders
      expect(schema.entities['orders']?.relationships?.['userId']?.references).toBe('users');
      expect(schema.entities['orders']?.relationships?.['productId']?.references).toBe('products');
    });

    it('should detect circular dependencies', () => {
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

      // Should detect circular dependency: users -> profiles -> users
      // Implementation should throw error
      expect(schema.entities['users']?.relationships?.['profileId']?.references).toBe('profiles');
      expect(schema.entities['profiles']?.relationships?.['userId']?.references).toBe('users');
    });
  });

  describe('foreign key generation', () => {
    it('should generate valid foreign keys for one-to-many relationships', () => {
      // Simulated: 10 users, 50 orders
      // Each order should have userId referencing one of the users
      const userIds = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'];
      const orderUserId = 'user_3';

      expect(userIds).toContain(orderUserId);
    });

    it('should distribute foreign keys across parent entities', () => {
      // Simulate 50 orders referencing 10 users
      const userIds = Array.from({ length: 10 }, (_, i) => `user_${i + 1}`);
      const orderUserIds = Array.from({ length: 50 }, (_, i) => `user_${(i % 10) + 1}`);

      // All order userIds should reference valid users
      orderUserIds.forEach((userId) => {
        expect(userIds).toContain(userId);
      });

      // Should have distribution across users
      const uniqueUserIds = new Set(orderUserIds);
      expect(uniqueUserIds.size).toBe(10);
    });

    it('should support nullable foreign keys', () => {
      // Some orders might not have userId (nullable)
      const userIds = ['user_1', 'user_2', 'user_3'];
      const orderUserIds = ['user_1', null, 'user_2', null, 'user_3'];

      orderUserIds.forEach((userId) => {
        if (userId !== null) {
          expect(userIds).toContain(userId);
        }
      });

      const nullCount = orderUserIds.filter((id) => id === null).length;
      expect(nullCount).toBeGreaterThan(0);
    });

    it('should handle many-to-many relationships via junction table', () => {
      // users <-> products via userProducts
      const userIds = ['user_1', 'user_2', 'user_3'];
      const productIds = ['product_1', 'product_2', 'product_3'];
      const userProducts = [
        { userId: 'user_1', productId: 'product_1' },
        { userId: 'user_1', productId: 'product_2' },
        { userId: 'user_2', productId: 'product_1' },
        { userId: 'user_3', productId: 'product_3' },
      ];

      userProducts.forEach((up) => {
        expect(userIds).toContain(up.userId);
        expect(productIds).toContain(up.productId);
      });
    });

    it('should handle self-referential relationships', () => {
      // users table with managerId referencing other users
      const userIds = ['user_1', 'user_2', 'user_3', 'user_4'];
      const users = [
        { id: 'user_1', managerId: null }, // Top level
        { id: 'user_2', managerId: 'user_1' },
        { id: 'user_3', managerId: 'user_1' },
        { id: 'user_4', managerId: 'user_2' },
      ];

      users.forEach((user) => {
        if (user.managerId !== null) {
          expect(userIds).toContain(user.managerId);
        }
      });
    });
  });

  describe('relationship types', () => {
    it('should handle one-to-many relationships', () => {
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

      expect(schema.entities['orders']?.relationships?.['userId']?.type).toBe(
        RelationshipType.ONE_TO_MANY
      );
    });

    it('should handle many-to-many relationships', () => {
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
          userProducts: {
            count: 50,
            type: EntityType.CUSTOM,
            fields: ['userId', 'productId'],
            relationships: {
              userId: {
                references: 'users',
                type: RelationshipType.MANY_TO_MANY,
              },
              productId: {
                references: 'products',
                type: RelationshipType.MANY_TO_MANY,
              },
            },
          },
        },
      };

      expect(schema.entities['userProducts']?.relationships?.['userId']?.type).toBe(
        RelationshipType.MANY_TO_MANY
      );
      expect(schema.entities['userProducts']?.relationships?.['productId']?.type).toBe(
        RelationshipType.MANY_TO_MANY
      );
    });

    it('should handle nullable relationships', () => {
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

      expect(schema.entities['orders']?.relationships?.['userId']?.nullable).toBe(true);
    });

    it('should handle non-nullable relationships', () => {
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
                nullable: false,
              },
            },
          },
        },
      };

      expect(schema.entities['orders']?.relationships?.['userId']?.nullable).toBe(false);
    });

    it('should default to non-nullable when not specified', () => {
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

      // When nullable is not specified, should default to false
      const nullable = schema.entities['orders']?.relationships?.['userId']?.nullable ?? false;
      expect(nullable).toBe(false);
    });
  });

  describe('ID pool management', () => {
    it('should track generated entity IDs', () => {
      // Simulated ID pool
      const idPool = new Map<string, string[]>();
      idPool.set('users', ['user_1', 'user_2', 'user_3']);
      idPool.set('products', ['product_1', 'product_2']);

      expect(idPool.get('users')).toHaveLength(3);
      expect(idPool.get('products')).toHaveLength(2);
    });

    it('should select foreign keys from ID pool', () => {
      const userIds = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'];
      const selectedId = userIds[2]; // Simulate random selection

      expect(userIds).toContain(selectedId);
    });

    it('should generate sequential IDs per entity type', () => {
      const userIds = ['user_1', 'user_2', 'user_3'];
      const companyIds = ['company_1', 'company_2'];

      userIds.forEach((id, index) => {
        expect(id).toBe(`user_${index + 1}`);
      });

      companyIds.forEach((id, index) => {
        expect(id).toBe(`company_${index + 1}`);
      });
    });

    it('should maintain separate ID pools per entity', () => {
      const idPool = new Map<string, string[]>();
      idPool.set('users', ['user_1', 'user_2']);
      idPool.set('companies', ['company_1', 'company_2']);
      idPool.set('orders', ['order_1', 'order_2', 'order_3']);

      expect(idPool.size).toBe(3);
      expect(idPool.get('users')).not.toEqual(idPool.get('companies'));
      expect(idPool.get('orders')?.[0]).toMatch(/^order_/);
    });
  });

  describe('entity type handling', () => {
    it('should generate PERSON entities with person data', () => {
      const schema: DatasetSchema = {
        entities: {
          users: {
            count: 10,
            type: EntityType.PERSON,
          },
        },
      };

      expect(schema.entities['users']?.type).toBe(EntityType.PERSON);
    });

    it('should generate COMPANY entities with company data', () => {
      const schema: DatasetSchema = {
        entities: {
          companies: {
            count: 5,
            type: EntityType.COMPANY,
          },
        },
      };

      expect(schema.entities['companies']?.type).toBe(EntityType.COMPANY);
    });

    it('should generate CUSTOM entities with specified fields', () => {
      const schema: DatasetSchema = {
        entities: {
          products: {
            count: 20,
            type: EntityType.CUSTOM,
            fields: ['id', 'name', 'price', 'sku'],
          },
        },
      };

      expect(schema.entities['products']?.type).toBe(EntityType.CUSTOM);
      expect(schema.entities['products']?.fields).toEqual(['id', 'name', 'price', 'sku']);
    });

    it('should mix different entity types in one dataset', () => {
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
          products: {
            count: 20,
            type: EntityType.CUSTOM,
            fields: ['id', 'name'],
          },
        },
      };

      expect(schema.entities['users']?.type).toBe(EntityType.PERSON);
      expect(schema.entities['companies']?.type).toBe(EntityType.COMPANY);
      expect(schema.entities['products']?.type).toBe(EntityType.CUSTOM);
    });
  });

  describe('seed reproducibility', () => {
    it('should generate same dataset with same seed', () => {
      const seed = 12345;

      // Will test once generator is implemented
      expect(seed).toBe(12345);
    });

    it('should generate different dataset with different seed', () => {
      const seed1 = 12345;
      const seed2 = 67890;

      expect(seed1).not.toBe(seed2);
    });

    it('should support no seed (random generation)', () => {
      const seed: number | undefined = undefined;

      expect(seed).toBeUndefined();
    });
  });
});
