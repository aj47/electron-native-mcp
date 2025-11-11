/**
 * Permission Management Tools
 * Tools for checking and managing macOS system permissions
 */

import { z } from 'zod';
import { permissionsManager } from '../../lib/permissions.js';
import type { ToolResult } from '../../types/index.js';

/**
 * Check permission status
 */
export const checkPermission = {
  name: 'check_permission',
  description: 'Check the status of a specific macOS system permission.',
  inputSchema: z.object({
    permission: z
      .enum(['accessibility', 'screen-capture', 'input-monitoring', 'camera', 'microphone'])
      .describe('The permission type to check'),
  }),
  handler: async (args: { permission: string }): Promise<ToolResult> => {
    try {
      const info = permissionsManager.getPermissionInfo(args.permission as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(info, null, 2),
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
 * Check all permissions
 */
export const checkAllPermissions = {
  name: 'check_all_permissions',
  description: 'Check the status of all required macOS system permissions.',
  inputSchema: z.object({}),
  handler: async (): Promise<ToolResult> => {
    try {
      const required = [
        'accessibility',
        'screen-capture',
        'input-monitoring',
      ] as const;
      const results = permissionsManager.checkAllPermissions([...required]);

      const output: any = {};
      for (const [type, info] of results) {
        output[type] = info;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(output, null, 2),
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
 * Get permission instructions
 */
export const getPermissionInstructions = {
  name: 'get_permission_instructions',
  description: 'Get instructions for granting a specific macOS system permission.',
  inputSchema: z.object({
    permission: z
      .enum(['accessibility', 'screen-capture', 'input-monitoring', 'camera', 'microphone'])
      .describe('The permission type'),
  }),
  handler: async (args: { permission: string }): Promise<ToolResult> => {
    try {
      const instructions = permissionsManager.getPermissionInstructions(args.permission as any);
      return {
        content: [
          {
            type: 'text',
            text: instructions,
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
 * Request permission
 */
export const requestPermission = {
  name: 'request_permission',
  description:
    'Request a specific macOS system permission. ' +
    'This will show a system dialog if the permission has not been determined yet.',
  inputSchema: z.object({
    permission: z
      .enum(['accessibility', 'screen-capture', 'input-monitoring', 'camera', 'microphone'])
      .describe('The permission type to request'),
  }),
  handler: async (args: { permission: string }): Promise<ToolResult> => {
    try {
      const status = await permissionsManager.requestPermission(args.permission as any);
      return {
        content: [
          {
            type: 'text',
            text: `Permission request result: ${status}`,
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

// Export all permission tools
export const permissionTools = [
  checkPermission,
  checkAllPermissions,
  getPermissionInstructions,
  requestPermission,
];

