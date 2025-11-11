# Usage Guide

## Quick Start

### 1. Build the Server

```bash
npm install
npm run build
```

### 2. Run the Server

```bash
npm start
```

### 3. Configure with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "electron-native": {
      "command": "node",
      "args": ["/absolute/path/to/electron-native-mcp/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to` with the actual path to your installation.

### 4. Grant macOS Permissions

The server requires these system permissions:

1. **Accessibility** - For UI automation
   - Go to System Settings → Privacy & Security → Accessibility
   - Add your terminal app (Terminal, iTerm2, VS Code, etc.)

2. **Screen Recording** - For screenshots
   - Go to System Settings → Privacy & Security → Screen Recording
   - Add your terminal app

3. **Input Monitoring** - For keyboard/mouse control
   - Go to System Settings → Privacy & Security → Input Monitoring
   - Add your terminal app

You can check permission status using the `check_all_permissions` tool.

## Testing with the Example Electron App

### 1. Install and Run the Test App

```bash
cd examples/test-electron-app
npm install
npm start
```

This will launch a test Electron app with `--inspect=9222` enabled.

### 2. Connect to the App

Use these tools in sequence:

```typescript
// 1. List available targets
list_electron_targets()

// 2. Connect to the test app (use the targetId from step 1)
connect_to_electron_target({ targetId: "..." })

// 3. Query for a button
query_selector({ 
  targetId: "...", 
  selector: "#clickMe" 
})

// 4. Click the button via JavaScript
execute_javascript({ 
  targetId: "...", 
  code: "document.getElementById('clickMe').click()" 
})

// 5. Take a screenshot
take_electron_screenshot({ targetId: "..." })
```

## Common Workflows

### Workflow 1: Automate Button Clicks

```typescript
// Find the button's position using DOM inspection
query_selector({ targetId: "...", selector: "#myButton" })

// Execute JavaScript to get button position
execute_javascript({ 
  targetId: "...", 
  code: `
    const btn = document.getElementById('myButton');
    const rect = btn.getBoundingClientRect();
    JSON.stringify({ x: rect.x, y: rect.y });
  `
})

// Click at that position
click({ x: 100, y: 200 })
```

### Workflow 2: Fill Out Forms

```typescript
// Click on input field
click({ x: 300, y: 150 })

// Type text
type_text({ text: "Hello, World!" })

// Press Enter
press_key({ key: "enter" })
```

### Workflow 3: Trigger Global Shortcuts

```typescript
// Open Spotlight
trigger_common_macos_hotkey({ hotkey: "spotlight" })

// Or use custom hotkey
trigger_hotkey({ 
  key: "space", 
  modifiers: ["command"] 
})
```

### Workflow 4: Take Screenshots

```typescript
// Full screen
take_screenshot()

// Specific region
take_screenshot({ 
  x: 0, 
  y: 0, 
  width: 800, 
  height: 600 
})
```

## Tool Categories

### DOM Inspection Tools (7 tools)

- `list_electron_targets` - List debuggable Electron windows
- `connect_to_electron_target` - Connect to a specific window
- `get_dom_tree` - Get the complete DOM tree
- `query_selector` - Find element by CSS selector
- `query_selector_all` - Find all matching elements
- `execute_javascript` - Run JavaScript in the window
- `take_electron_screenshot` - Screenshot of Electron content

### UI Automation Tools (9 tools)

- `get_mouse_position` - Get current mouse position
- `move_mouse` - Move mouse to coordinates
- `click` - Click at position
- `double_click` - Double click
- `drag` - Drag from one position to another
- `type_text` - Type text
- `press_key` - Press key with modifiers
- `take_screenshot` - Screenshot of screen/region
- `get_screen_size` - Get screen dimensions

### Hotkey Tools (4 tools)

- `trigger_hotkey` - Trigger custom keyboard shortcut
- `trigger_common_macos_hotkey` - Trigger system hotkeys
- `simulate_app_shortcut` - Simulate app-specific shortcuts
- `send_key_sequence` - Send sequence of key presses

### Permission Tools (4 tools)

- `check_permission` - Check specific permission
- `check_all_permissions` - Check all required permissions
- `get_permission_instructions` - Get setup instructions
- `request_permission` - Request a permission

## Troubleshooting

### "Permission Denied" Errors

Run `check_all_permissions` to see which permissions are missing, then grant them in System Settings.

### Cannot Connect to Electron App

Make sure the Electron app is running with `--inspect=9222`:

```bash
/path/to/app --inspect=9222
```

### Screenshots Not Working

Ensure Screen Recording permission is granted for your terminal app.

### RobotJS Build Errors

RobotJS requires native compilation. If you encounter build errors:

```bash
# Make sure you have Xcode Command Line Tools
xcode-select --install

# Rebuild robotjs
npm rebuild robotjs
```

## Advanced Usage

### Custom CDP Port

If your Electron app uses a different debug port:

```typescript
list_electron_targets({ port: 9223 })
```

### Multiple Electron Apps

You can connect to multiple Electron apps simultaneously by using different target IDs.

### Keyboard Shortcuts Reference

Common macOS hotkeys available via `trigger_common_macos_hotkey`:

- `spotlight` - Command+Space
- `mission_control` - Control+Up
- `app_switcher` - Command+Tab
- `screenshot_full` - Command+Shift+3
- `screenshot_selection` - Command+Shift+4
- `screenshot_window` - Command+Shift+4 then Space
- `show_desktop` - F3
- `lock_screen` - Command+Control+Q
- `force_quit` - Command+Option+Escape
- `emoji_picker` - Command+Control+Space

## Development

### Running in Development Mode

```bash
npm run dev
```

### Watching for Changes

```bash
npm run watch
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Notes

- The server uses stdio transport for communication with MCP clients
- All mouse/keyboard automation requires Accessibility permission
- Screenshots require Screen Recording permission
- CDP connection requires Electron app to be running with `--inspect` flag
- RobotJS is used for native UI automation (cross-platform but macOS-focused)

