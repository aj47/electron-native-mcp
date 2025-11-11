/**
 * Type definitions for Electron Native MCP Server
 */

// CDP (Chrome DevTools Protocol) Types
export interface CDPTarget {
  id: string;
  type: string;
  title: string;
  url: string;
  webSocketDebuggerUrl?: string;
  devtoolsFrontendUrl?: string;
}

export interface CDPConnection {
  targetId: string;
  client: any; // chrome-remote-interface client
  connected: boolean;
}

export interface DOMNode {
  nodeId: number;
  nodeType: number;
  nodeName: string;
  localName?: string;
  nodeValue?: string;
  childNodeCount?: number;
  children?: DOMNode[];
  attributes?: string[];
  documentURL?: string;
  baseURL?: string;
  publicId?: string;
  systemId?: string;
  internalSubset?: string;
  xmlVersion?: string;
  name?: string;
  value?: string;
  pseudoType?: string;
  shadowRootType?: string;
  frameId?: string;
  contentDocument?: DOMNode;
  shadowRoots?: DOMNode[];
  templateContent?: DOMNode;
  pseudoElements?: DOMNode[];
  importedDocument?: DOMNode;
  distributedNodes?: DOMNode[];
  isSVG?: boolean;
}

// macOS Accessibility Types
export interface AccessibilityElement {
  role: string;
  title?: string;
  value?: any;
  description?: string;
  enabled: boolean;
  focused: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  children?: AccessibilityElement[];
  actions?: string[];
}

export interface MacOSApplication {
  pid: number;
  name: string;
  bundleId?: string;
  active: boolean;
  windows?: MacOSWindow[];
}

export interface MacOSWindow {
  id: number;
  title: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  minimized: boolean;
  visible: boolean;
}

// Hotkey Types
export interface HotkeyDefinition {
  id: string;
  modifiers: KeyModifier[];
  key: string;
  description?: string;
}

export type KeyModifier = 'command' | 'control' | 'option' | 'shift' | 'fn';

export interface KeyPressEvent {
  key: string;
  modifiers: KeyModifier[];
  timestamp: number;
}

// Permission Types
export type PermissionType =
  | 'accessibility'
  | 'screen-capture'
  | 'input-monitoring'
  | 'camera'
  | 'microphone';

export type PermissionStatus = 'not-determined' | 'denied' | 'authorized' | 'restricted';

export interface PermissionInfo {
  type: PermissionType;
  status: PermissionStatus;
  canRequest: boolean;
}

// Tool Result Types
export interface ToolResult {
  [x: string]: unknown;
  content: Array<
    | {
        type: 'text';
        text: string;
      }
    | {
        type: 'image';
        data: string;
        mimeType: string;
      }
  >;
  isError?: boolean;
}

// Configuration Types
export interface ServerConfig {
  cdp?: {
    host?: string;
    port?: number;
    timeout?: number;
  };
  automation?: {
    screenshotFormat?: 'png' | 'jpeg';
    screenshotQuality?: number;
    clickDelay?: number;
    typeDelay?: number;
  };
  permissions?: {
    autoRequest?: boolean;
    requiredPermissions?: PermissionType[];
  };
}

// Error Types
export class ElectronMCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ElectronMCPError';
  }
}

export class CDPError extends ElectronMCPError {
  constructor(message: string, details?: any) {
    super(message, 'CDP_ERROR', details);
    this.name = 'CDPError';
  }
}

export class AccessibilityError extends ElectronMCPError {
  constructor(message: string, details?: any) {
    super(message, 'ACCESSIBILITY_ERROR', details);
    this.name = 'AccessibilityError';
  }
}

export class PermissionError extends ElectronMCPError {
  constructor(message: string, details?: any) {
    super(message, 'PERMISSION_ERROR', details);
    this.name = 'PermissionError';
  }
}

