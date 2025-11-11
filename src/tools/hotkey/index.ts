/**
 * Global Hotkey Tools
 * Tools for triggering global keyboard shortcuts on macOS
 */

import { z } from 'zod';
import { accessibilityManager } from '../../lib/accessibility.js';
import type { ToolResult } from '../../types/index.js';

/**
 * Trigger a global hotkey combination
 */
export const triggerHotkey = {
  name: 'trigger_hotkey',
  description:
    'Trigger a global keyboard shortcut (hotkey) on macOS. ' +
    'This simulates pressing a key combination like Command+Space, Command+Tab, etc.',
  inputSchema: z.object({
    key: z.string().describe('The main key to press (e.g., "space", "tab", "c", "v")'),
    modifiers: z
      .array(z.enum(['command', 'cmd', 'control', 'ctrl', 'option', 'alt', 'shift']))
      .describe('Modifier keys (e.g., ["command"], ["command", "shift"])'),
  }),
  handler: async (args: { key: string; modifiers: string[] }): Promise<ToolResult> => {
    try {
      await accessibilityManager.pressKey(args.key, args.modifiers);
      const hotkeyString = [...args.modifiers, args.key].join('+');
      return {
        content: [
          {
            type: 'text',
            text: `Triggered hotkey: ${hotkeyString}`,
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
 * Common macOS hotkeys helper
 */
export const triggerCommonHotkey = {
  name: 'trigger_common_macos_hotkey',
  description:
    'Trigger a common macOS system hotkey by name. ' +
    'Examples: spotlight, mission_control, app_switcher, screenshot, etc.',
  inputSchema: z.object({
    hotkey: z
      .enum([
        'spotlight',
        'mission_control',
        'app_switcher',
        'screenshot_full',
        'screenshot_selection',
        'screenshot_window',
        'show_desktop',
        'lock_screen',
        'force_quit',
        'emoji_picker',
        'character_viewer',
      ])
      .describe('The common hotkey to trigger'),
  }),
  handler: async (args: { hotkey: string }): Promise<ToolResult> => {
    try {
      // Map common hotkeys to their key combinations
      const hotkeyMap: Record<string, { key: string; modifiers: string[] }> = {
        spotlight: { key: 'space', modifiers: ['command'] },
        mission_control: { key: 'up', modifiers: ['control'] },
        app_switcher: { key: 'tab', modifiers: ['command'] },
        screenshot_full: { key: '3', modifiers: ['command', 'shift'] },
        screenshot_selection: { key: '4', modifiers: ['command', 'shift'] },
        screenshot_window: { key: '4', modifiers: ['command', 'shift'] }, // Then press space
        show_desktop: { key: 'f3', modifiers: [] },
        lock_screen: { key: 'q', modifiers: ['command', 'control'] },
        force_quit: { key: 'escape', modifiers: ['command', 'option'] },
        emoji_picker: { key: 'space', modifiers: ['command', 'control'] },
        character_viewer: { key: 'space', modifiers: ['command', 'control'] },
      };

      const combo = hotkeyMap[args.hotkey];
      if (!combo) {
        return {
          content: [
            {
              type: 'text',
              text: `Unknown hotkey: ${args.hotkey}`,
            },
          ],
          isError: true,
        };
      }

      await accessibilityManager.pressKey(combo.key, combo.modifiers);

      // Special case for screenshot_window - need to press space after
      if (args.hotkey === 'screenshot_window') {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await accessibilityManager.pressKey('space', []);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Triggered ${args.hotkey} hotkey`,
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
 * Simulate keyboard shortcut in application
 */
export const simulateAppShortcut = {
  name: 'simulate_app_shortcut',
  description:
    'Simulate an application-specific keyboard shortcut. ' +
    'Useful for triggering menu items or app-specific actions.',
  inputSchema: z.object({
    shortcut: z.string().describe('Shortcut description (e.g., "Command+N for New Window")'),
    key: z.string().describe('The main key'),
    modifiers: z.array(z.string()).optional().describe('Modifier keys'),
  }),
  handler: async (args: { shortcut: string; key: string; modifiers?: string[] }): Promise<ToolResult> => {
    try {
      await accessibilityManager.pressKey(args.key, args.modifiers || []);
      return {
        content: [
          {
            type: 'text',
            text: `Simulated shortcut: ${args.shortcut}`,
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
 * Send key sequence
 */
export const sendKeySequence = {
  name: 'send_key_sequence',
  description:
    'Send a sequence of key presses. Useful for complex keyboard interactions.',
  inputSchema: z.object({
    sequence: z
      .array(
        z.object({
          key: z.string(),
          modifiers: z.array(z.string()).optional(),
          delayMs: z.number().optional().describe('Delay after this key press in milliseconds'),
        })
      )
      .describe('Array of key presses to execute in order'),
  }),
  handler: async (args: {
    sequence: Array<{ key: string; modifiers?: string[]; delayMs?: number }>;
  }): Promise<ToolResult> => {
    try {
      for (const step of args.sequence) {
        await accessibilityManager.pressKey(step.key, step.modifiers || []);
        if (step.delayMs) {
          await new Promise((resolve) => setTimeout(resolve, step.delayMs));
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Executed key sequence with ${args.sequence.length} steps`,
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

// Export all hotkey tools
export const hotkeyTools = [
  triggerHotkey,
  triggerCommonHotkey,
  simulateAppShortcut,
  sendKeySequence,
];

