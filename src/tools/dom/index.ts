/**
 * DOM Inspection Tools
 * Tools for inspecting and interacting with Electron app DOM via CDP
 */

import { z } from 'zod';
import { CDPClient } from '../../lib/cdp-client.js';
import type { ToolResult } from '../../types/index.js';

const cdpClient = new CDPClient();

/**
 * List all available Electron targets
 */
export const listElectronTargets = {
  name: 'list_electron_targets',
  description:
    'List all available Electron app windows and webviews that can be debugged. ' +
    'The Electron app must be running with --inspect or --inspect-brk flag.',
  inputSchema: z.object({
    host: z.string().optional().describe('CDP host (default: localhost)'),
    port: z.number().optional().describe('CDP port (default: 9222)'),
  }),
  handler: async (args: { host?: string; port?: number }): Promise<ToolResult> => {
    try {
      if (args.host || args.port) {
        // Create new client with custom host/port
        const customClient = new CDPClient(args.host, args.port);
        const targets = await customClient.listTargets();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(targets, null, 2),
            },
          ],
        };
      }

      const targets = await cdpClient.listTargets();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(targets, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Connect to an Electron target
 */
export const connectToTarget = {
  name: 'connect_to_electron_target',
  description: 'Connect to a specific Electron window or webview for debugging.',
  inputSchema: z.object({
    targetId: z.string().describe('The target ID from list_electron_targets'),
  }),
  handler: async (args: { targetId: string }): Promise<ToolResult> => {
    try {
      await cdpClient.connect(args.targetId);
      return {
        content: [
          {
            type: 'text',
            text: `Successfully connected to target ${args.targetId}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Get the DOM tree
 */
export const getDOMTree = {
  name: 'get_dom_tree',
  description: 'Get the complete DOM tree of a connected Electron target.',
  inputSchema: z.object({
    targetId: z.string().describe('The target ID to get DOM from'),
    depth: z.number().optional().describe('Maximum depth to traverse (default: -1 for full tree)'),
  }),
  handler: async (args: { targetId: string; depth?: number }): Promise<ToolResult> => {
    try {
      const document = await cdpClient.getDocument(args.targetId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(document, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Query selector
 */
export const querySelector = {
  name: 'query_selector',
  description: 'Find a DOM element using a CSS selector.',
  inputSchema: z.object({
    targetId: z.string().describe('The target ID'),
    selector: z.string().describe('CSS selector (e.g., "#myButton", ".className")'),
  }),
  handler: async (args: { targetId: string; selector: string }): Promise<ToolResult> => {
    try {
      const nodeId = await cdpClient.querySelector(args.targetId, args.selector);

      if (!nodeId) {
        return {
          content: [
            {
              type: 'text',
              text: `No element found matching selector: ${args.selector}`,
            },
          ],
        };
      }

      const attributes = await cdpClient.getNodeAttributes(args.targetId, nodeId);
      const outerHTML = await cdpClient.getOuterHTML(args.targetId, nodeId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                nodeId,
                selector: args.selector,
                attributes,
                outerHTML: outerHTML.substring(0, 500), // Limit output
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Query selector all
 */
export const querySelectorAll = {
  name: 'query_selector_all',
  description: 'Find all DOM elements matching a CSS selector.',
  inputSchema: z.object({
    targetId: z.string().describe('The target ID'),
    selector: z.string().describe('CSS selector'),
  }),
  handler: async (args: { targetId: string; selector: string }): Promise<ToolResult> => {
    try {
      const nodeIds = await cdpClient.querySelectorAll(args.targetId, args.selector);

      if (nodeIds.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No elements found matching selector: ${args.selector}`,
            },
          ],
        };
      }

      // Get details for each node (limit to first 10 to avoid overwhelming output)
      const details = await Promise.all(
        nodeIds.slice(0, 10).map(async (nodeId) => {
          const attributes = await cdpClient.getNodeAttributes(args.targetId, nodeId);
          return { nodeId, attributes };
        })
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: nodeIds.length,
                showing: details.length,
                elements: details,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Execute JavaScript
 */
export const executeJavaScript = {
  name: 'execute_javascript',
  description: 'Execute JavaScript code in the context of an Electron window.',
  inputSchema: z.object({
    targetId: z.string().describe('The target ID'),
    code: z.string().describe('JavaScript code to execute'),
  }),
  handler: async (args: { targetId: string; code: string }): Promise<ToolResult> => {
    try {
      const result = await cdpClient.evaluate(args.targetId, args.code);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ result }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Take screenshot
 */
export const takeScreenshot = {
  name: 'take_electron_screenshot',
  description: 'Take a screenshot of an Electron window.',
  inputSchema: z.object({
    targetId: z.string().describe('The target ID'),
    format: z.enum(['png', 'jpeg']).optional().describe('Image format (default: png)'),
    quality: z.number().min(0).max(100).optional().describe('JPEG quality (0-100)'),
  }),
  handler: async (args: {
    targetId: string;
    format?: 'png' | 'jpeg';
    quality?: number;
  }): Promise<ToolResult> => {
    try {
      const base64Data = await cdpClient.screenshot(args.targetId, {
        format: args.format,
        quality: args.quality,
      });

      return {
        content: [
          {
            type: 'image',
            data: base64Data,
            mimeType: `image/${args.format || 'png'}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

// Export all DOM tools
export const domTools = [
  listElectronTargets,
  connectToTarget,
  getDOMTree,
  querySelector,
  querySelectorAll,
  executeJavaScript,
  takeScreenshot,
];

