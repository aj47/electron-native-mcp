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

async function ensureConnected(): Promise<{ client: CDPClient; targetId: string }> {
  if (!cdpClient) {
    cdpClient = new CDPClient();
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

const TOOL_DESCRIPTION = `electron_execute is a tool to control Electron applications via Chrome DevTools Protocol.

If you get an error "No Electron targets found", tell the user to start their Electron app with the --inspect=9222 flag.

execute tool lets you run JavaScript code snippets to control the Electron window. These code snippets are preferred to be in a single line to make them more readable in agent interface, separating statements with semicolons.

You can extract data from your script by returning values. The last expression's value will be returned.

To keep variables between calls, use the \`state\` global object. Regular variables are reset between runs. Example: \`state.counter = (state.counter || 0) + 1\`

You MUST use multiple execute tool calls for complex logic. This ensures:
- You have clear understanding of intermediate state between interactions
- You can split finding an element from interacting with it, making it simpler to understand issues

The code runs in the Electron renderer process context with access to:
- \`document\`: the DOM document
- \`window\`: the window object
- All standard browser APIs

## Examples

### Get page info
\`\`\`js
JSON.stringify({ title: document.title, url: window.location.href, readyState: document.readyState })
\`\`\`

### Click a button
\`\`\`js
document.querySelector('#myButton').click(); 'clicked'
\`\`\`

### Fill an input
\`\`\`js
const input = document.querySelector('#email'); input.value = 'test@example.com'; input.dispatchEvent(new Event('input', { bubbles: true })); 'filled'
\`\`\`

### Get all links on page
\`\`\`js
Array.from(document.querySelectorAll('a')).map(a => ({ text: a.textContent?.trim(), href: a.href })).slice(0, 20)
\`\`\`

### Check element visibility
\`\`\`js
const el = document.querySelector('#loading'); el ? { visible: el.offsetParent !== null, text: el.textContent } : 'element not found'
\`\`\`

### Wait for element (use in subsequent calls)
\`\`\`js
document.querySelector('.results') ? 'ready' : 'not yet'
\`\`\`

### Store data between calls
\`\`\`js
state.items = state.items || []; state.items.push(document.querySelector('h1')?.textContent); state.items.length + ' items collected'
\`\`\`

## Rules

- Always check the current page state after an action (click, submit, etc.) - you cannot assume what happened
- Use multiple calls: first find elements, then interact, then verify results
- Return meaningful values to understand what happened
- Use state object to persist data between calls
- Keep code snippets short and focused on one task`;

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
    'Reset the CDP connection to the Electron app. Use this when the MCP stops responding or you get connectivity errors. ' +
    'This will disconnect from the current target and clear any state. You may lose custom properties that were added to the page scope (window.__electronMcpState).',
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

