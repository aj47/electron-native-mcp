/**
 * MCP Server Setup
 * Configures and exports the MCP server with all tools
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { domTools } from './tools/dom/index.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: 'electron-native-mcp',
    version: '0.1.0',
  });

  // Register tools
  for (const tool of domTools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema.shape,
      },
      tool.handler
    );
  }

  return server;
}

