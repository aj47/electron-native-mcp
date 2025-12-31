/**
 * Electron Native MCP - Execute JavaScript Tool
 * Tool for controlling Electron apps via Chrome DevTools Protocol
 */

import { z } from 'zod';
import { CDPClient } from '../../lib/cdp-client.js';
import type { ToolResult } from '../../types/index.js';

// CDP client instance - will auto-connect to first available target
let cdpClient: CDPClient | null = null;
let connectedTargetId: string | null = null;

// Get CDP port from environment variable or default to 9222
const CDP_PORT = parseInt(process.env.CDP_PORT || '9222', 10);

async function ensureConnected(): Promise<{ client: CDPClient; targetId: string }> {
  if (!cdpClient) {
    cdpClient = new CDPClient('localhost', CDP_PORT);
  }

  // If already connected, return existing connection
  if (connectedTargetId && cdpClient.isConnected(connectedTargetId)) {
    return { client: cdpClient, targetId: connectedTargetId };
  }

  // Auto-connect to first available target
  const targets = await cdpClient.listTargets();
  const pageTargets = targets.filter((t) => t.type === 'page');

  if (pageTargets.length === 0) {
    throw new Error(
      'No Electron targets found. Make sure your Electron app is running with --inspect=9222 flag.'
    );
  }

  connectedTargetId = pageTargets[0].id;
  await cdpClient.connect(connectedTargetId);

  return { client: cdpClient, targetId: connectedTargetId };
}

const TOOL_DESCRIPTION = `Execute JavaScript in an Electron app's renderer process via CDP.

Returns the last expression's value. Use \`state\` object to persist data between calls.

Key patterns:
- Click: document.querySelector('#btn').click(); 'done'
- Fill input: el.value='text'; el.dispatchEvent(new Event('input',{bubbles:true}))
- Read DOM: Array.from(document.querySelectorAll('a')).map(a=>({text:a.textContent,href:a.href}))

Best practices:
- Use multiple calls: find element → interact → verify result
- Always return a value to confirm what happened
- Check page state after actions (don't assume)

Error "No Electron targets found" = app needs --inspect flag or CDP_PORT env var mismatch.`;

/**
 * Execute JavaScript in Electron
 */
export const executeJavaScript = {
  name: 'electron_execute',
  description: TOOL_DESCRIPTION,
  inputSchema: z.object({
    code: z.string().describe('JavaScript code to execute in the Electron renderer process'),
  }),
  handler: async (args: { code: string }): Promise<ToolResult> => {
    try {
      const { client, targetId } = await ensureConnected();

      // Wrap code to inject state and handle returns properly
      const wrappedCode = `
        (function() {
          const state = window.__electronMcpState = window.__electronMcpState || {};
          try {
            const __result = eval(${JSON.stringify(args.code)});
            return __result;
          } catch (e) {
            return { __error: true, message: e.message, stack: e.stack };
          }
        })()
      `;

      const result = await client.evaluate(targetId, wrappedCode);

      // Check for errors from the wrapped execution
      if (result && typeof result === 'object' && result.__error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${result.message}\n${result.stack || ''}`,
            },
          ],
          isError: true,
        };
      }

      // Format the result
      const output =
        result === undefined
          ? 'undefined'
          : typeof result === 'string'
            ? result
            : JSON.stringify(result, null, 2);

      return {
        content: [
          {
            type: 'text',
            text: output,
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
 * Reset connection
 */
export const resetConnection = {
  name: 'electron_reset',
  description:
    'Reset CDP connection. Use when execute times out or returns connectivity errors. Clears the state object.',
  inputSchema: z.object({}),
  handler: async (): Promise<ToolResult> => {
    try {
      // Disconnect existing connection
      if (cdpClient && connectedTargetId) {
        try {
          await cdpClient.disconnect(connectedTargetId);
        } catch {
          // Ignore disconnect errors
        }
      }

      // Reset state
      cdpClient = null;
      connectedTargetId = null;

      // Reconnect to verify it works
      const { targetId } = await ensureConnected();

      return {
        content: [
          {
            type: 'text',
            text: `Connection reset successfully. Connected to target: ${targetId}`,
          },
        ],
      };
    } catch (error: any) {
      // Still reset state even if reconnect fails
      cdpClient = null;
      connectedTargetId = null;

      return {
        content: [
          {
            type: 'text',
            text: `Connection reset. Reconnect failed: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

// Export all DOM tools
export const domTools = [executeJavaScript, resetConnection];

