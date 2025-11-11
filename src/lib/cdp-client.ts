/**
 * Chrome DevTools Protocol Client
 * Manages connections to Electron apps for DOM inspection
 */

// @ts-ignore - no types available for chrome-remote-interface
import CDP from 'chrome-remote-interface';
import type { CDPTarget, CDPConnection, DOMNode } from '../types/index.js';
import { CDPError } from '../types/index.js';

export class CDPClient {
  private connections: Map<string, CDPConnection> = new Map();
  private host: string;
  private port: number;

  constructor(host = 'localhost', port = 9222) {
    this.host = host;
    this.port = port;
  }

  /**
   * List all available CDP targets (Electron windows/webviews)
   */
  async listTargets(): Promise<CDPTarget[]> {
    try {
      const targets = await CDP.List({ host: this.host, port: this.port });
      return targets.map((target: any) => ({
        id: target.id,
        type: target.type,
        title: target.title,
        url: target.url,
        webSocketDebuggerUrl: target.webSocketDebuggerUrl,
        devtoolsFrontendUrl: target.devtoolsFrontendUrl,
      }));
    } catch (error: any) {
      throw new CDPError(
        `Failed to list CDP targets. Make sure Electron is running with --inspect flag.`,
        { originalError: error.message, host: this.host, port: this.port }
      );
    }
  }

  /**
   * Connect to a specific target
   */
  async connect(targetId: string): Promise<void> {
    try {
      // Check if already connected
      if (this.connections.has(targetId)) {
        const existing = this.connections.get(targetId)!;
        if (existing.connected) {
          return;
        }
      }

      // Create new connection
      const client = await CDP({
        host: this.host,
        port: this.port,
        target: targetId,
      });

      // Enable required domains
      await Promise.all([
        client.DOM.enable(),
        client.Runtime.enable(),
        client.Page.enable(),
        client.Network.enable(),
      ]);

      this.connections.set(targetId, {
        targetId,
        client,
        connected: true,
      });
    } catch (error: any) {
      throw new CDPError(`Failed to connect to target ${targetId}`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Disconnect from a target
   */
  async disconnect(targetId: string): Promise<void> {
    const connection = this.connections.get(targetId);
    if (connection && connection.connected) {
      try {
        await connection.client.close();
        connection.connected = false;
      } catch (error) {
        // Ignore errors on disconnect
      }
      this.connections.delete(targetId);
    }
  }

  /**
   * Disconnect from all targets
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.keys()).map((targetId) =>
      this.disconnect(targetId)
    );
    await Promise.all(disconnectPromises);
  }

  /**
   * Get the DOM document for a target
   */
  async getDocument(targetId: string): Promise<DOMNode> {
    const connection = this.getConnection(targetId);

    try {
      const { root } = await connection.client.DOM.getDocument({ depth: -1 });
      return root as DOMNode;
    } catch (error: any) {
      throw new CDPError(`Failed to get document for target ${targetId}`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Query selector in the DOM
   */
  async querySelector(targetId: string, selector: string): Promise<number | null> {
    const connection = this.getConnection(targetId);

    try {
      const { root } = await connection.client.DOM.getDocument();
      const { nodeId } = await connection.client.DOM.querySelector({
        nodeId: root.nodeId,
        selector,
      });
      return nodeId || null;
    } catch (error: any) {
      throw new CDPError(`Failed to query selector "${selector}"`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Query all matching selectors
   */
  async querySelectorAll(targetId: string, selector: string): Promise<number[]> {
    const connection = this.getConnection(targetId);

    try {
      const { root } = await connection.client.DOM.getDocument();
      const { nodeIds } = await connection.client.DOM.querySelectorAll({
        nodeId: root.nodeId,
        selector,
      });
      return nodeIds || [];
    } catch (error: any) {
      throw new CDPError(`Failed to query selector all "${selector}"`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Get attributes of a DOM node
   */
  async getNodeAttributes(targetId: string, nodeId: number): Promise<Record<string, string>> {
    const connection = this.getConnection(targetId);

    try {
      const { attributes } = await connection.client.DOM.getAttributes({ nodeId });
      const result: Record<string, string> = {};

      // Attributes come as [name1, value1, name2, value2, ...]
      for (let i = 0; i < attributes.length; i += 2) {
        result[attributes[i]] = attributes[i + 1];
      }

      return result;
    } catch (error: any) {
      throw new CDPError(`Failed to get attributes for node ${nodeId}`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Get outer HTML of a node
   */
  async getOuterHTML(targetId: string, nodeId: number): Promise<string> {
    const connection = this.getConnection(targetId);

    try {
      const { outerHTML } = await connection.client.DOM.getOuterHTML({ nodeId });
      return outerHTML;
    } catch (error: any) {
      throw new CDPError(`Failed to get outer HTML for node ${nodeId}`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Execute JavaScript in the page context
   */
  async evaluate(targetId: string, expression: string): Promise<any> {
    const connection = this.getConnection(targetId);

    try {
      const { result, exceptionDetails } = await connection.client.Runtime.evaluate({
        expression,
        returnByValue: true,
        awaitPromise: true,
      });

      if (exceptionDetails) {
        throw new Error(exceptionDetails.text || 'JavaScript execution failed');
      }

      return result.value;
    } catch (error: any) {
      throw new CDPError(`Failed to evaluate JavaScript`, {
        originalError: error.message,
        expression,
      });
    }
  }

  /**
   * Take a screenshot of the page
   */
  async screenshot(
    targetId: string,
    options?: { format?: 'png' | 'jpeg'; quality?: number }
  ): Promise<string> {
    const connection = this.getConnection(targetId);

    try {
      const { data } = await connection.client.Page.captureScreenshot({
        format: options?.format || 'png',
        quality: options?.quality,
      });
      return data;
    } catch (error: any) {
      throw new CDPError(`Failed to capture screenshot`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Get a connection or throw error
   */
  private getConnection(targetId: string): CDPConnection {
    const connection = this.connections.get(targetId);
    if (!connection || !connection.connected) {
      throw new CDPError(`Not connected to target ${targetId}. Call connect() first.`);
    }
    return connection;
  }

  /**
   * Check if connected to a target
   */
  isConnected(targetId: string): boolean {
    const connection = this.connections.get(targetId);
    return connection?.connected || false;
  }

  /**
   * Get all active connections
   */
  getActiveConnections(): string[] {
    return Array.from(this.connections.entries())
      .filter(([_, conn]) => conn.connected)
      .map(([targetId]) => targetId);
  }
}

