/**
 * MCP Server Setup
 * Configures and exports the MCP server with all tools
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { domTools } from './tools/dom/index.js';
import { uiTools } from './tools/ui/index.js';
import { hotkeyTools } from './tools/hotkey/index.js';
import { permissionTools } from './tools/permissions/index.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: 'electron-native-mcp',
    version: '0.1.0',
  });

  // Register all DOM inspection tools
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

  // Register all UI automation tools
  for (const tool of uiTools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema.shape,
      },
      tool.handler
    );
  }

  // Register all hotkey tools
  for (const tool of hotkeyTools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema.shape,
      },
      tool.handler
    );
  }

  // Register all permission tools
  for (const tool of permissionTools) {
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

