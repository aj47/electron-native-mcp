/**
 * macOS Accessibility API Wrapper
 * Provides UI automation capabilities using robotjs
 */

import robot from 'robotjs';
import { AccessibilityError } from '../types/index.js';
import { permissionsManager } from './permissions.js';

export class AccessibilityManager {
  private static instance: AccessibilityManager;

  private constructor() {
    // Configure robotjs settings
    robot.setMouseDelay(2);
    robot.setKeyboardDelay(50);
  }

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  /**
   * Verify accessibility permissions
   */
  private verifyPermissions(): void {
    const status = permissionsManager.checkPermission('accessibility');
    if (status !== 'authorized') {
      throw new AccessibilityError(
        'Accessibility permission not granted. ' +
          permissionsManager.getPermissionInstructions('accessibility')
      );
    }
  }

  /**
   * Get current mouse position
   */
  async getMousePosition(): Promise<{ x: number; y: number }> {
    try {
      const position = robot.getMousePos();
      return { x: position.x, y: position.y };
    } catch (error: any) {
      throw new AccessibilityError('Failed to get mouse position', {
        originalError: error.message,
      });
    }
  }

  /**
   * Move mouse to position
   */
  async moveMouse(x: number, y: number): Promise<void> {
    this.verifyPermissions();

    try {
      robot.moveMouse(x, y);
    } catch (error: any) {
      throw new AccessibilityError(`Failed to move mouse to (${x}, ${y})`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Click at current position or specific coordinates
   */
  async click(x?: number, y?: number, button: 'left' | 'right' | 'middle' = 'left'): Promise<void> {
    this.verifyPermissions();

    try {
      if (x !== undefined && y !== undefined) {
        robot.moveMouse(x, y);
      }

      robot.mouseClick(button);
    } catch (error: any) {
      throw new AccessibilityError(`Failed to click at (${x}, ${y})`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Double click
   */
  async doubleClick(x?: number, y?: number): Promise<void> {
    this.verifyPermissions();

    try {
      if (x !== undefined && y !== undefined) {
        robot.moveMouse(x, y);
      }
      robot.mouseClick('left', true); // true for double click
    } catch (error: any) {
      throw new AccessibilityError(`Failed to double click`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Drag from one position to another
   */
  async drag(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
    this.verifyPermissions();

    try {
      robot.moveMouse(fromX, fromY);
      robot.mouseToggle('down');
      robot.dragMouse(toX, toY);
      robot.mouseToggle('up');
    } catch (error: any) {
      throw new AccessibilityError(`Failed to drag from (${fromX}, ${fromY}) to (${toX}, ${toY})`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Type text
   */
  async typeText(text: string): Promise<void> {
    this.verifyPermissions();

    try {
      robot.typeString(text);
    } catch (error: any) {
      throw new AccessibilityError(`Failed to type text: "${text}"`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Press a key
   */
  async pressKey(key: string, modifiers: string[] = []): Promise<void> {
    this.verifyPermissions();

    try {
      // Map common key names to robotjs key names
      const keyMap: Record<string, string> = {
        enter: 'enter',
        return: 'enter',
        tab: 'tab',
        space: 'space',
        backspace: 'backspace',
        delete: 'delete',
        escape: 'escape',
        esc: 'escape',
        up: 'up',
        down: 'down',
        left: 'left',
        right: 'right',
        home: 'home',
        end: 'end',
        pageup: 'pageup',
        pagedown: 'pagedown',
        f1: 'f1',
        f2: 'f2',
        f3: 'f3',
        f4: 'f4',
        f5: 'f5',
        f6: 'f6',
        f7: 'f7',
        f8: 'f8',
        f9: 'f9',
        f10: 'f10',
        f11: 'f11',
        f12: 'f12',
        command: 'command',
        cmd: 'command',
        control: 'control',
        ctrl: 'control',
        option: 'alt',
        alt: 'alt',
        shift: 'shift',
      };

      const robotKey = keyMap[key.toLowerCase()] || key;

      // Handle modifiers - robotjs uses modifier array
      const robotModifiers = modifiers.map((mod) => keyMap[mod.toLowerCase()] || mod);

      if (robotModifiers.length > 0) {
        robot.keyTap(robotKey, robotModifiers);
      } else {
        robot.keyTap(robotKey);
      }
    } catch (error: any) {
      throw new AccessibilityError(`Failed to press key: ${key}`, {
        originalError: error.message,
        modifiers,
      });
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(region?: { x: number; y: number; width: number; height: number }): Promise<string> {
    const screenCaptureStatus = permissionsManager.checkPermission('screen-capture');
    if (screenCaptureStatus !== 'authorized') {
      throw new AccessibilityError(
        'Screen Recording permission not granted. ' +
          permissionsManager.getPermissionInstructions('screen-capture')
      );
    }

    try {
      let screenshot;
      if (region) {
        screenshot = robot.screen.capture(region.x, region.y, region.width, region.height);
      } else {
        const screenSize = robot.getScreenSize();
        screenshot = robot.screen.capture(0, 0, screenSize.width, screenSize.height);
      }

      // Convert to base64 PNG
      const image = screenshot.image;

      // Create a simple PNG buffer (this is a simplified version)
      // In production, you'd want to use a proper PNG encoding library
      const base64 = Buffer.from(image).toString('base64');
      return base64;
    } catch (error: any) {
      throw new AccessibilityError('Failed to take screenshot', {
        originalError: error.message,
        region,
      });
    }
  }

  /**
   * Get screen size
   */
  async getScreenSize(): Promise<{ width: number; height: number }> {
    try {
      const size = robot.getScreenSize();
      return { width: size.width, height: size.height };
    } catch (error: any) {
      throw new AccessibilityError('Failed to get screen size', {
        originalError: error.message,
      });
    }
  }

  /**
   * Get pixel color at position
   */
  async getPixelColor(x: number, y: number): Promise<string> {
    try {
      const color = robot.getPixelColor(x, y);
      return color;
    } catch (error: any) {
      throw new AccessibilityError(`Failed to get pixel color at (${x}, ${y})`, {
        originalError: error.message,
      });
    }
  }
}

export const accessibilityManager = AccessibilityManager.getInstance();

