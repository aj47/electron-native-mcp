/**
 * UI Automation Tools
 * Tools for interacting with native macOS UI elements
 */

import { z } from 'zod';
import { accessibilityManager } from '../../lib/accessibility.js';
import type { ToolResult } from '../../types/index.js';

/**
 * Get mouse position
 */
export const getMousePosition = {
  name: 'get_mouse_position',
  description: 'Get the current mouse cursor position on screen.',
  inputSchema: z.object({}),
  handler: async (): Promise<ToolResult> => {
    try {
      const position = await accessibilityManager.getMousePosition();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(position, null, 2),
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
 * Move mouse
 */
export const moveMouse = {
  name: 'move_mouse',
  description: 'Move the mouse cursor to a specific position on screen.',
  inputSchema: z.object({
    x: z.number().describe('X coordinate in pixels'),
    y: z.number().describe('Y coordinate in pixels'),
  }),
  handler: async (args: { x: number; y: number }): Promise<ToolResult> => {
    try {
      await accessibilityManager.moveMouse(args.x, args.y);
      return {
        content: [
          {
            type: 'text',
            text: `Mouse moved to (${args.x}, ${args.y})`,
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

/**
 * Double click
 */
export const doubleClick = {
  name: 'double_click',
  description: 'Double click at the current mouse position or at specific coordinates.',
  inputSchema: z.object({
    x: z.number().optional().describe('X coordinate (optional)'),
    y: z.number().optional().describe('Y coordinate (optional)'),
  }),
  handler: async (args: { x?: number; y?: number }): Promise<ToolResult> => {
    try {
      await accessibilityManager.doubleClick(args.x, args.y);
      const location = args.x !== undefined && args.y !== undefined ? ` at (${args.x}, ${args.y})` : '';
      return {
        content: [
          {
            type: 'text',
            text: `Double clicked${location}`,
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
 * Drag
 */
export const drag = {
  name: 'drag',
  description: 'Drag from one position to another on screen.',
  inputSchema: z.object({
    fromX: z.number().describe('Starting X coordinate'),
    fromY: z.number().describe('Starting Y coordinate'),
    toX: z.number().describe('Ending X coordinate'),
    toY: z.number().describe('Ending Y coordinate'),
  }),
  handler: async (args: { fromX: number; fromY: number; toX: number; toY: number }): Promise<ToolResult> => {
    try {
      await accessibilityManager.drag(args.fromX, args.fromY, args.toX, args.toY);
      return {
        content: [
          {
            type: 'text',
            text: `Dragged from (${args.fromX}, ${args.fromY}) to (${args.toX}, ${args.toY})`,
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
 * Type text
 */
export const typeText = {
  name: 'type_text',
  description: 'Type text at the current cursor position. Make sure to click on a text field first.',
  inputSchema: z.object({
    text: z.string().describe('Text to type'),
  }),
  handler: async (args: { text: string }): Promise<ToolResult> => {
    try {
      await accessibilityManager.typeText(args.text);
      return {
        content: [
          {
            type: 'text',
            text: `Typed: "${args.text}"`,
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
 * Press key
 */
export const pressKey = {
  name: 'press_key',
  description:
    'Press a keyboard key with optional modifiers. ' +
    'Supports special keys like enter, tab, escape, arrow keys, function keys, etc.',
  inputSchema: z.object({
    key: z.string().describe('Key to press (e.g., "enter", "a", "f1", "escape")'),
    modifiers: z
      .array(z.enum(['command', 'cmd', 'control', 'ctrl', 'option', 'alt', 'shift']))
      .optional()
      .describe('Modifier keys to hold (e.g., ["command", "shift"])'),
  }),
  handler: async (args: { key: string; modifiers?: string[] }): Promise<ToolResult> => {
    try {
      await accessibilityManager.pressKey(args.key, args.modifiers || []);
      const modText = args.modifiers && args.modifiers.length > 0 ? `${args.modifiers.join('+')}+` : '';
      return {
        content: [
          {
            type: 'text',
            text: `Pressed: ${modText}${args.key}`,
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
  name: 'take_screenshot',
  description: 'Take a screenshot of the entire screen or a specific region.',
  inputSchema: z.object({
    x: z.number().optional().describe('Region X coordinate (optional)'),
    y: z.number().optional().describe('Region Y coordinate (optional)'),
    width: z.number().optional().describe('Region width (optional)'),
    height: z.number().optional().describe('Region height (optional)'),
  }),
  handler: async (args: { x?: number; y?: number; width?: number; height?: number }): Promise<ToolResult> => {
    try {
      let region;
      if (args.x !== undefined && args.y !== undefined && args.width !== undefined && args.height !== undefined) {
        region = { x: args.x, y: args.y, width: args.width, height: args.height };
      }

      const base64Data = await accessibilityManager.takeScreenshot(region);
      return {
        content: [
          {
            type: 'image',
            data: base64Data,
            mimeType: 'image/png',
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
 * Get screen size
 */
export const getScreenSize = {
  name: 'get_screen_size',
  description: 'Get the dimensions of the primary screen.',
  inputSchema: z.object({}),
  handler: async (): Promise<ToolResult> => {
    try {
      const size = await accessibilityManager.getScreenSize();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(size, null, 2),
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
  getMousePosition,
  moveMouse,
  click,
  doubleClick,
  drag,
  typeText,
  pressKey,
  takeScreenshot,
  getScreenSize,
];

