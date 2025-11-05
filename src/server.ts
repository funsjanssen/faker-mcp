import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP (Model Context Protocol) Server for fake data generation.
 * Manages tool registration, request handling, and server lifecycle.
 *
 * @class FakerMCPServer
 * @example
 * ```typescript
 * const server = new FakerMCPServer();
 * server.registerTool(generatePersonTool, handleGeneratePerson);
 * await server.start();
 * ```
 */
export class FakerMCPServer {
  private server: Server;
  private tools: Map<string, Tool>;
  private toolHandlers: Map<string, (args: unknown) => Promise<{ content: unknown[] }>>;

  /**
   * Creates a new FakerMCPServer instance with default configuration.
   * Initializes the MCP server with tool capabilities and sets up request handlers.
   *
   * @constructor
   */
  constructor() {
    this.tools = new Map();
    this.toolHandlers = new Map();

    this.server = new Server(
      {
        name: 'faker-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Registers a tool with the server, making it available for MCP clients.
   * Tools must be registered before starting the server.
   *
   * @param {Tool} tool - The MCP tool definition with name, description, and input schema
   * @param {Function} handler - Handler function that processes tool requests
   * @returns {void}
   * @example
   * ```typescript
   * server.registerTool(
   *   {
   *     name: 'generate-person',
   *     description: 'Generates fake person data',
   *     inputSchema: { ... }
   *   },
   *   async (args) => {
   *     // Handle generation
   *     return { content: [...] };
   *   }
   * );
   * ```
   */
  public registerTool(
    tool: Tool,
    handler: (args: unknown) => Promise<{ content: unknown[] }>
  ): void {
    this.tools.set(tool.name, tool);
    this.toolHandlers.set(tool.name, handler);
  }

  /**
   * Sets up MCP protocol request handlers for tool listing and execution.
   * This is called automatically during server construction.
   *
   * @private
   * @returns {void}
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: Array.from(this.tools.values()),
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const handler = this.toolHandlers.get(toolName);

      if (!handler) {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      try {
        const args = request.params.arguments ?? {};
        return await handler(args);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Tool execution failed: ${errorMessage}`);
      }
    });
  }

  /**
   * Starts the server with stdio transport for communication.
   * The server will listen for MCP requests on stdin/stdout.
   *
   * @async
   * @returns {Promise<void>} Resolves when the server is successfully started
   * @throws {Error} If server fails to start or connect to transport
   * @example
   * ```typescript
   * const server = new FakerMCPServer();
   * server.registerTool(myTool, myHandler);
   * await server.start();
   * console.log('Server running on stdio');
   * ```
   */
  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  /**
   * Gets the underlying MCP Server instance.
   * Useful for advanced configuration or testing.
   *
   * @returns {Server} The underlying MCP Server instance
   * @example
   * ```typescript
   * const mcpServer = server.getServer();
   * // Use for advanced operations or testing
   * ```
   */
  public getServer(): Server {
    return this.server;
  }
}
