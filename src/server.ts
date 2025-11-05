import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP Server for fake data generation
 */
export class FakerMCPServer {
  private server: Server;
  private tools: Map<string, Tool>;
  private toolHandlers: Map<string, (args: unknown) => Promise<{ content: unknown[] }>>;

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
   * Register a tool with the server
   */
  public registerTool(
    tool: Tool,
    handler: (args: unknown) => Promise<{ content: unknown[] }>
  ): void {
    this.tools.set(tool.name, tool);
    this.toolHandlers.set(tool.name, handler);
  }

  /**
   * Setup request handlers
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
   * Start the server with stdio transport
   */
  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  /**
   * Get the underlying MCP server instance
   */
  public getServer(): Server {
    return this.server;
  }
}
