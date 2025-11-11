#!/usr/bin/env node

/**
 * Electron Native MCP Server
 * Entry point for the MCP server
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
  // Create the MCP server
  const server = createServer();

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP communication)
  console.error('Electron Native MCP Server started');
  console.error('Server name: electron-native-mcp');
  console.error('Version: 0.1.0');
  console.error('');
  console.error('Available tool categories:');
  console.error('  - DOM Inspection (7 tools): Connect to Electron apps via CDP');
  console.error('  - UI Automation (9 tools): Control native macOS UI elements');
  console.error('  - Global Hotkeys (4 tools): Trigger keyboard shortcuts');
  console.error('  - Permissions (4 tools): Manage macOS system permissions');
  console.error('');
  console.error('Total: 24 tools available');
  console.error('');
  console.error('Note: This server requires macOS system permissions:');
  console.error('  - Accessibility (for UI automation and hotkeys)');
  console.error('  - Screen Recording (for screenshots)');
  console.error('  - Input Monitoring (for keyboard/mouse control)');
  console.error('');
  console.error('Use the permission tools to check and request permissions.');
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

