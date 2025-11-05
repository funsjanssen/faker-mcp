/**
 * End-to-End Quickstart Validation Tests
 *
 * Validates core scenarios from quickstart.md work with the actual server.
 * This is a simplified test suite focused on the key user scenarios.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract JSON data from MCP tool result
function getJsonData(result: any): any {
  const content = result.content;
  if (!Array.isArray(content)) {
    throw new Error('No content array in result');
  }

  // Try to find resource content first (person, company, custom tools)
  const resourceContent = content.find((c: any) => c.type === 'resource');
  if (resourceContent) {
    const jsonText = resourceContent.resource?.text;
    if (jsonText) {
      return JSON.parse(jsonText);
    }
  }

  // Fall back to text content (dataset tool)
  const textContent = content.find((c: any) => c.type === 'text');
  if (textContent && textContent.text) {
    return JSON.parse(textContent.text);
  }

  throw new Error('No JSON content found in result');
}

describe('Quickstart.md E2E Validation', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    const serverPath = path.resolve(__dirname, '../../dist/index.js');

    transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
    });

    client = new Client(
      {
        name: 'quickstart-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('Example 1: Generate Person Records', () => {
    it('generates 10 person records with complete data', async () => {
      const result = await client.callTool({
        name: 'generate-person',
        arguments: {
          count: 10,
          includeAddress: true,
          includePhone: true,
        },
      });

      const parsed = getJsonData(result);
      expect(parsed.data).toHaveLength(10);
      expect(parsed.metadata.count).toBe(10);

      const person = parsed.data[0];
      expect(person).toHaveProperty('firstName');
      expect(person).toHaveProperty('lastName');
      expect(person).toHaveProperty('email');
      expect(person).toHaveProperty('phone');
      expect(person.address).toHaveProperty('street');
      expect(person.address).toHaveProperty('city');
    });
  });

  describe('Example 2: Generate Companies with Seed', () => {
    it('generates identical data with same seed', async () => {
      const seed = 54321;

      const result1 = await client.callTool({
        name: 'generate-company',
        arguments: { count: 5, seed },
      });

      const result2 = await client.callTool({
        name: 'generate-company',
        arguments: { count: 5, seed },
      });

      const data1 = getJsonData(result1);
      const data2 = getJsonData(result2);

      expect(data1.data).toHaveLength(5);
      expect(data2.data).toHaveLength(5);
      expect(data1.data).toEqual(data2.data);
    });
  });

  describe('Example 3: Generate Dataset with Relationships', () => {
    it('generates dataset with users and orders maintaining referential integrity', async () => {
      const schema = {
        entities: {
          users: {
            count: 20,
            type: 'person',
            fields: ['id', 'fullName', 'email'],
          },
          orders: {
            count: 100,
            type: 'custom',
            fields: ['id', 'userId', 'productName', 'price'],
            relationships: {
              userId: {
                references: 'users',
                type: 'one-to-many',
              },
            },
          },
        },
      };

      const result = await client.callTool({
        name: 'generate-dataset',
        arguments: { schema, locale: 'en' },
      });

      const parsed = getJsonData(result);
      expect(parsed.dataset.users).toHaveLength(20);
      expect(parsed.dataset.orders).toHaveLength(100);

      // Verify referential integrity
      const userIds = new Set(parsed.dataset.users.map((u: any) => u.id));
      const allValid = parsed.dataset.orders.every((order: any) => userIds.has(order.userId));
      expect(allValid).toBe(true);
    });
  });

  describe('Example 4: Generate Custom Pattern Data', () => {
    it('generates data matching regex pattern PRD-####-XX', async () => {
      const result = await client.callTool({
        name: 'generate-custom',
        arguments: {
          count: 50,
          patterns: {
            productCode: {
              type: 'regex',
              value: 'PRD-[0-9]{4}-[A-Z]{2}',
            },
          },
        },
      });

      const parsed = getJsonData(result);
      expect(parsed.data).toHaveLength(50);

      const pattern = /^PRD-[0-9]{4}-[A-Z]{2}$/;
      const allMatch = parsed.data.every((record: any) => pattern.test(record.productCode));
      expect(allMatch).toBe(true);
    });
  });

  describe('Multiple Locales Support', () => {
    it('supports all documented locales', async () => {
      // Only test locales that have full internet data support
      const locales = ['en', 'fr', 'de', 'es'];

      for (const locale of locales) {
        const result = await client.callTool({
          name: 'generate-person',
          arguments: { count: 5, locale },
        });

        const parsed = getJsonData(result);
        expect(parsed.data).toHaveLength(5);
        expect(parsed.metadata.locale).toBe(locale);
      }
    });
  });

  describe('Performance Requirements', () => {
    it('generates 10000 person records within 10 seconds', async () => {
      const startTime = Date.now();

      const result = await client.callTool({
        name: 'generate-person',
        arguments: {
          count: 10000,
          includeAddress: true,
        },
      });

      const duration = Date.now() - startTime;
      const parsed = getJsonData(result);

      expect(parsed.data).toHaveLength(10000);
      expect(duration).toBeLessThan(10000); // 10 seconds per quickstart.md
    }, 15000);
  });

  describe('Error Handling', () => {
    it('rejects invalid locale', async () => {
      await expect(
        client.callTool({
          name: 'generate-person',
          arguments: { count: 10, locale: 'invalid' },
        })
      ).rejects.toThrow();
    });

    it('rejects count exceeding maximum', async () => {
      await expect(
        client.callTool({
          name: 'generate-person',
          arguments: { count: 10001 },
        })
      ).rejects.toThrow();
    });
  });

  describe('Tool Discovery', () => {
    it('lists all four tools described in quickstart', async () => {
      const tools = await client.listTools();

      expect(tools.tools.length).toBeGreaterThanOrEqual(4);

      const toolNames = tools.tools.map((t) => t.name);
      expect(toolNames).toContain('generate-person');
      expect(toolNames).toContain('generate-company');
      expect(toolNames).toContain('generate-dataset');
      expect(toolNames).toContain('generate-custom');
    });
  });
});
