/**
 * macOS Permissions Manager
 * Handles checking and requesting system permissions
 */

import permissions from 'node-mac-permissions';
import type { PermissionType, PermissionStatus, PermissionInfo } from '../types/index.js';

export class PermissionsManager {
  private static instance: PermissionsManager;

  private constructor() {}

  static getInstance(): PermissionsManager {
    if (!PermissionsManager.instance) {
      PermissionsManager.instance = new PermissionsManager();
    }
    return PermissionsManager.instance;
  }

  /**
   * Check the status of a specific permission
   */
  checkPermission(type: PermissionType): PermissionStatus {
    try {
      const permissionMap: Record<PermissionType, string> = {
        accessibility: 'accessibility',
        'screen-capture': 'screen',
        'input-monitoring': 'input-monitoring',
        camera: 'camera',
        microphone: 'microphone',
      };

      const macType = permissionMap[type];
      const status = permissions.getAuthStatus(macType as any);
      return status as PermissionStatus;
    } catch (error) {
      console.error(`Error checking ${type} permission:`, error);
      return 'not-determined';
    }
  }

  /**
   * Get information about a permission
   */
  getPermissionInfo(type: PermissionType): PermissionInfo {
    const status = this.checkPermission(type);
    const canRequest = status === 'not-determined';

    return {
      type,
      status,
      canRequest,
    };
  }

  /**
   * Request a specific permission
   */
  async requestPermission(type: PermissionType): Promise<PermissionStatus> {
    try {
      const currentStatus = this.checkPermission(type);

      // If already authorized, return immediately
      if (currentStatus === 'authorized') {
        return 'authorized';
      }

      // If denied or restricted, we can't request again
      if (currentStatus === 'denied' || currentStatus === 'restricted') {
        return currentStatus;
      }

      // Request the permission
      switch (type) {
        case 'accessibility':
          await permissions.askForAccessibilityAccess();
          break;
        case 'screen-capture':
          await permissions.askForScreenCaptureAccess();
          break;
        case 'input-monitoring':
          await permissions.askForInputMonitoringAccess();
          break;
        case 'camera':
          await permissions.askForCameraAccess();
          break;
        case 'microphone':
          await permissions.askForMicrophoneAccess();
          break;
      }

      // Check the status again after requesting
      return this.checkPermission(type);
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return 'denied';
    }
  }

  /**
   * Check all required permissions
   */
  checkAllPermissions(required: PermissionType[]): Map<PermissionType, PermissionInfo> {
    const results = new Map<PermissionType, PermissionInfo>();

    for (const type of required) {
      results.set(type, this.getPermissionInfo(type));
    }

    return results;
  }

  /**
   * Verify that all required permissions are granted
   */
  verifyPermissions(required: PermissionType[]): {
    granted: boolean;
    missing: PermissionType[];
    details: Map<PermissionType, PermissionInfo>;
  } {
    const details = this.checkAllPermissions(required);
    const missing: PermissionType[] = [];

    for (const [type, info] of details) {
      if (info.status !== 'authorized') {
        missing.push(type);
      }
    }

    return {
      granted: missing.length === 0,
      missing,
      details,
    };
  }

  /**
   * Get instructions for granting a permission
   */
  getPermissionInstructions(type: PermissionType): string {
    const instructions: Record<PermissionType, string> = {
      accessibility: `
To grant Accessibility permission:
1. Open System Settings (System Preferences on older macOS)
2. Go to Privacy & Security → Accessibility
3. Enable access for your terminal app (Terminal, iTerm2, VS Code, etc.)
4. You may need to restart the application
      `.trim(),
      'screen-capture': `
To grant Screen Recording permission:
1. Open System Settings (System Preferences on older macOS)
2. Go to Privacy & Security → Screen Recording
3. Enable access for your terminal app (Terminal, iTerm2, VS Code, etc.)
4. You may need to restart the application
      `.trim(),
      'input-monitoring': `
To grant Input Monitoring permission:
1. Open System Settings (System Preferences on older macOS)
2. Go to Privacy & Security → Input Monitoring
3. Enable access for your terminal app (Terminal, iTerm2, VS Code, etc.)
4. You may need to restart the application
      `.trim(),
      camera: `
To grant Camera permission:
1. Open System Settings (System Preferences on older macOS)
2. Go to Privacy & Security → Camera
3. Enable access for your terminal app
      `.trim(),
      microphone: `
To grant Microphone permission:
1. Open System Settings (System Preferences on older macOS)
2. Go to Privacy & Security → Microphone
3. Enable access for your terminal app
      `.trim(),
    };

    return instructions[type];
  }
}

export const permissionsManager = PermissionsManager.getInstance();

