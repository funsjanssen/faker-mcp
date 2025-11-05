import { describe, it, expect, beforeEach } from 'vitest';
import { FakerMCPServer } from '../../src/server.js';
import { generatePersonTool, handleGeneratePerson } from '../../src/tools/generate-person.js';
import { generateCompanyTool, handleGenerateCompany } from '../../src/tools/generate-company.js';
import { generateDatasetTool, handleGenerateDataset } from '../../src/tools/generate-dataset.js';
import { generateCustomTool, handleGenerateCustom } from '../../src/tools/generate-custom.js';

describe('MCP Server Integration Tests', () => {
  let server: FakerMCPServer;

  beforeEach(() => {
    server = new FakerMCPServer();
  });

  describe('Server Initialization', () => {
    it('should create server instance successfully', () => {
      expect(server).toBeDefined();
      expect(server.getServer()).toBeDefined();
    });

    it('should register all tools successfully', () => {
      expect(() => {
        server.registerTool(generatePersonTool, handleGeneratePerson);
        server.registerTool(generateCompanyTool, handleGenerateCompany);
        server.registerTool(generateDatasetTool, async (args) => {
          await Promise.resolve();
          return handleGenerateDataset(args);
        });
        server.registerTool(generateCustomTool, handleGenerateCustom);
      }).not.toThrow();
    });
  });

  describe('Tool Execution', () => {
    beforeEach(() => {
      server.registerTool(generatePersonTool, handleGeneratePerson);
      server.registerTool(generateCompanyTool, handleGenerateCompany);
      server.registerTool(generateDatasetTool, async (args) => {
        await Promise.resolve();
        return handleGenerateDataset(args);
      });
      server.registerTool(generateCustomTool, handleGenerateCustom);
    });

    it('should generate person data successfully', async () => {
      const result = await handleGeneratePerson({ count: 5, locale: 'en' });

      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[1]).toHaveProperty('type', 'resource');

      const resource = result.content[1] as { type: string; resource: { text: string } };
      const data = JSON.parse(resource.resource.text) as { data: unknown[] };
      expect(data.data).toHaveLength(5);
    });

    it('should generate company data successfully', async () => {
      const result = await handleGenerateCompany({ count: 3, locale: 'en' });

      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[1]).toHaveProperty('type', 'resource');

      const resource = result.content[1] as { type: string; resource: { text: string } };
      const data = JSON.parse(resource.resource.text) as { data: unknown[] };
      expect(data.data).toHaveLength(3);
    });

    it('should generate custom data successfully', async () => {
      const result = await handleGenerateCustom({
        count: 4,
        patterns: {
          status: { type: 'enum', value: ['active', 'inactive'] },
        },
        locale: 'en',
      });

      expect(result.content).toHaveLength(2);
      const resource = result.content[1] as { type: string; resource: { text: string } };
      const responseData = JSON.parse(resource.resource.text) as { data: unknown[] };
      expect(responseData.data).toHaveLength(4);
    });

    it('should generate dataset with relationships successfully', () => {
      const result = handleGenerateDataset({
        schema: {
          entities: {
            users: {
              count: 5,
              type: 'person',
              fields: ['id', 'fullName', 'email'],
            },
            orders: {
              count: 10,
              type: 'custom',
              fields: ['id', 'userId', 'productName'],
              relationships: {
                userId: {
                  references: 'users',
                  type: 'one-to-many',
                },
              },
            },
          },
        },
        locale: 'en',
      });

      expect(result.content).toHaveLength(1);
      const content = result.content[0] as { type: string; text: string };
      const response = JSON.parse(content.text) as {
        dataset: { users: unknown[]; orders: unknown[] };
      };
      expect(response.dataset.users).toHaveLength(5);
      expect(response.dataset.orders).toHaveLength(10);
    });
  });

  describe('Concurrent Requests', () => {
    beforeEach(() => {
      server.registerTool(generatePersonTool, handleGeneratePerson);
      server.registerTool(generateCompanyTool, handleGenerateCompany);
    });

    it('should handle 5 concurrent person generation requests', async () => {
      const promises = Array.from({ length: 5 }, () =>
        handleGeneratePerson({ count: 10, locale: 'en' })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.content).toHaveLength(2);
        const resource = result.content[1] as { type: string; resource: { text: string } };
        const data = JSON.parse(resource.resource.text) as { data: unknown[] };
        expect(data.data).toHaveLength(10);
      });
    });

    it('should handle mixed concurrent requests', async () => {
      const promises = [
        handleGeneratePerson({ count: 5, locale: 'en' }),
        handleGenerateCompany({ count: 5, locale: 'en' }),
        handleGeneratePerson({ count: 3, locale: 'fr' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.content).toHaveLength(2);
      });
    });
  });

  describe('Seed Reproducibility', () => {
    beforeEach(() => {
      server.registerTool(generatePersonTool, handleGeneratePerson);
      server.registerTool(generateCompanyTool, handleGenerateCompany);
    });

    it('should produce identical results with same seed', async () => {
      const seed = 12345;

      const person1 = await handleGeneratePerson({ count: 3, seed, locale: 'en' });
      const person2 = await handleGeneratePerson({ count: 3, seed, locale: 'en' });

      const resource1 = person1.content[1] as { type: string; resource: { text: string } };
      const resource2 = person2.content[1] as { type: string; resource: { text: string } };

      const data1 = JSON.parse(resource1.resource.text) as { data: unknown[] };
      const data2 = JSON.parse(resource2.resource.text) as { data: unknown[] };

      expect(data1.data).toEqual(data2.data);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      server.registerTool(generatePersonTool, handleGeneratePerson);
    });

    it('should reject invalid count parameters', async () => {
      // Test with negative count
      try {
        await handleGeneratePerson({ count: -1, locale: 'en' });
        expect.fail('Should have thrown an error for negative count');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('count');
      }

      // Test with count exceeding maximum
      try {
        await handleGeneratePerson({ count: 10001, locale: 'en' });
        expect.fail('Should have thrown an error for count exceeding maximum');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('count');
      }
    });

    it('should reject invalid locale', async () => {
      try {
        await handleGeneratePerson({ count: 1, locale: 'invalid' as 'en' });
        expect.fail('Should have thrown an error for invalid locale');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('locale');
      }
    });
  });

  describe('Large Data Generation', () => {
    beforeEach(() => {
      server.registerTool(generatePersonTool, handleGeneratePerson);
      server.registerTool(generateCompanyTool, handleGenerateCompany);
    });

    it('should handle large person generation requests (1000 records)', async () => {
      const result = await handleGeneratePerson({ count: 1000, locale: 'en' });

      expect(result.content).toHaveLength(2);
      const resource = result.content[1] as { type: string; resource: { text: string } };
      const data = JSON.parse(resource.resource.text) as { data: unknown[] };
      expect(data.data).toHaveLength(1000);
    });

    it('should handle large company generation requests (1000 records)', async () => {
      const result = await handleGenerateCompany({ count: 1000, locale: 'en' });

      expect(result.content).toHaveLength(2);
      const resource = result.content[1] as { type: string; resource: { text: string } };
      const data = JSON.parse(resource.resource.text) as { data: unknown[] };
      expect(data.data).toHaveLength(1000);
    });
  });
});
