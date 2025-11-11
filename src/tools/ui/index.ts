/**
 * UI Automation Tools
 * Tools for interacting with native macOS UI elements
 */

import { z } from 'zod';
import { accessibilityManager } from '../../lib/accessibility.js';
import type { ToolResult } from '../../types/index.js';

/**
 * Click
 */
export const click = {
  name: 'click',
  description:
    'Click at the current mouse position or at specific coordinates. ' +
    'Supports left, right, and middle mouse buttons.',
  inputSchema: z.object({
    x: z.number().optional().describe('X coordinate (optional, uses current position if not provided)'),
    y: z.number().optional().describe('Y coordinate (optional, uses current position if not provided)'),
    button: z.enum(['left', 'right', 'middle']).optional().describe('Mouse button (default: left)'),
  }),
  handler: async (args: { x?: number; y?: number; button?: 'left' | 'right' | 'middle' }): Promise<ToolResult> => {
    try {
      await accessibilityManager.click(args.x, args.y, args.button);
      const location = args.x !== undefined && args.y !== undefined ? ` at (${args.x}, ${args.y})` : '';
      return {
        content: [
          {
            type: 'text',
            text: `Clicked ${args.button || 'left'} button${location}`,
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

// Export all UI tools
export const uiTools = [
  click,
];

