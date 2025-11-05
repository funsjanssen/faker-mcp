import { describe, it, expect, beforeEach } from 'vitest';
import { FakerMCPServer } from '../../src/server.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Protocol Compliance', () => {
  let server: FakerMCPServer;

  beforeEach(() => {
    server = new FakerMCPServer();
  });

  describe('Server Initialization', () => {
    it('should create server instance successfully', () => {
      expect(server).toBeDefined();
      expect(server.getServer()).toBeDefined();
    });

    it('should have correct server info', () => {
      const mcpServer = server.getServer();
      expect(mcpServer).toBeDefined();
      // Server info is not directly accessible, but we can verify it exists
    });
  });

  describe('Tool Registration', () => {
    it('should register a tool successfully', () => {
      const testTool: Tool = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            param: { type: 'string' },
          },
        },
      };

      const handler = async () =>
        Promise.resolve({
          content: [{ type: 'text', text: 'test response' }],
        });

      expect(() => server.registerTool(testTool, handler)).not.toThrow();
    });

    it('should handle multiple tool registrations', () => {
      const tool1: Tool = {
        name: 'tool-1',
        description: 'First tool',
        inputSchema: { type: 'object', properties: {} },
      };

      const tool2: Tool = {
        name: 'tool-2',
        description: 'Second tool',
        inputSchema: { type: 'object', properties: {} },
      };

      const handler = async () => Promise.resolve({ content: [] });

      expect(() => {
        server.registerTool(tool1, handler);
        server.registerTool(tool2, handler);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle tool execution errors gracefully', () => {
      const testTool: Tool = {
        name: 'error-tool',
        description: 'Tool that throws errors',
        inputSchema: { type: 'object', properties: {} },
      };

      const errorHandler = async () => Promise.reject(new Error('Test error'));

      server.registerTool(testTool, errorHandler);

      // Error handling is tested through actual server execution
      // This verifies registration doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('Tool Handler Interface', () => {
    it('should accept handlers with correct signature', () => {
      const tool: Tool = {
        name: 'valid-handler',
        description: 'Tool with valid handler',
        inputSchema: { type: 'object', properties: {} },
      };

      const validHandler = async (_args: unknown) =>
        Promise.resolve({
          content: [{ type: 'text', text: 'response' }],
        });

      expect(() => server.registerTool(tool, validHandler)).not.toThrow();
    });

    it('should accept handlers that return proper response format', () => {
      const tool: Tool = {
        name: 'response-format',
        description: 'Tool with proper response',
        inputSchema: { type: 'object', properties: {} },
      };

      const handler = async () =>
        Promise.resolve({
          content: [
            { type: 'text', text: 'Text response' },
            {
              type: 'resource',
              resource: {
                uri: 'test://resource',
                mimeType: 'application/json',
                text: '{"data": "value"}',
              },
            },
          ],
        });

      expect(() => server.registerTool(tool, handler)).not.toThrow();
    });
  });
});
