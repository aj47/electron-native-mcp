# Electron Native MCP Server

A powerful Model Context Protocol (MCP) server for debugging and automating native Electron applications on macOS. This server provides comprehensive tools for DOM inspection, UI automation, and global hotkey triggering.

## Features

### 🔍 DOM Inspection (7 tools)
- Connect to Electron apps via Chrome DevTools Protocol (CDP)
- List all debuggable targets (windows, webviews)
- Query and inspect DOM elements
- Execute JavaScript in Electron windows
- Take screenshots of Electron content

### 🖱️ UI Automation (9 tools)
- Control mouse (move, click, double-click, drag)
- Keyboard input (type text, press keys)
- Take screenshots of native UI
- Get screen dimensions and mouse position
- Full macOS accessibility API integration

### ⌨️ Global Hotkeys (4 tools)
- Trigger custom keyboard shortcuts
- Activate common macOS hotkeys (Spotlight, Mission Control, etc.)
- Simulate application-specific shortcuts
- Send complex key sequences

### 🔐 Permission Management (4 tools)
- Check permission status
- Request system permissions
- Get setup instructions
- Verify all required permissions

## Requirements

- **macOS** 12.0 or later
- **Node.js** 18.0 or later
- **Electron app** running with `--inspect` flag (for DOM inspection)

### Required macOS Permissions

This server requires the following system permissions:

1. **Accessibility** - For UI automation and keyboard/mouse control
2. **Screen Recording** - For taking screenshots
3. **Input Monitoring** - For keyboard and mouse input

## Installation

### Quick Setup (Recommended)

```bash
# Run the setup script
./scripts/setup.sh
```

This will:
- Check system requirements
- Install dependencies
- Build the project
- Provide configuration instructions
- Optionally install the example app

### Manual Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### Configuring with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "electron-native": {
      "command": "node",
      "args": ["/path/to/electron-native-mcp/dist/index.js"]
    }
  }
}
```

### Configuring with Other MCP Clients

The server uses stdio transport and can be integrated with any MCP-compatible client.

## Tool Reference

### DOM Inspection Tools

#### `list_electron_targets`
List all available Electron windows and webviews.

```typescript
// Example usage
{
  "host": "localhost",  // optional
  "port": 9222          // optional
}
```

#### `connect_to_electron_target`
Connect to a specific Electron target for debugging.

```typescript
{
  "targetId": "target-id-from-list"
}
```

#### `get_dom_tree`
Get the complete DOM tree of a connected target.

```typescript
{
  "targetId": "target-id"
}
```

#### `query_selector`
Find a DOM element using CSS selector.

```typescript
{
  "targetId": "target-id",
  "selector": "#myButton"
}
```

#### `execute_javascript`
Execute JavaScript in an Electron window.

```typescript
{
  "targetId": "target-id",
  "code": "document.title"
}
```

### UI Automation Tools

#### `click`
Click at coordinates or current position.

```typescript
{
  "x": 100,           // optional
  "y": 200,           // optional
  "button": "left"    // left, right, or middle
}
```

#### `type_text`
Type text at the current cursor position.

```typescript
{
  "text": "Hello, World!"
}
```

#### `press_key`
Press a key with optional modifiers.

```typescript
{
  "key": "enter",
  "modifiers": ["command", "shift"]  // optional
}
```

#### `take_screenshot`
Capture a screenshot of the screen or region.

```typescript
{
  "x": 0,        // optional
  "y": 0,        // optional
  "width": 800,  // optional
  "height": 600  // optional
}
```

### Hotkey Tools

#### `trigger_hotkey`
Trigger a custom keyboard shortcut.

```typescript
{
  "key": "space",
  "modifiers": ["command"]
}
```

#### `trigger_common_macos_hotkey`
Trigger a common macOS system hotkey.

```typescript
{
  "hotkey": "spotlight"  // spotlight, mission_control, app_switcher, etc.
}
```

### Permission Tools

#### `check_all_permissions`
Check the status of all required permissions.

```typescript
{}  // No parameters
```

## Debugging Electron Apps

To debug an Electron app with this server:

1. **Launch your Electron app with the inspect flag:**
   ```bash
   /path/to/your/app.app/Contents/MacOS/YourApp --inspect=9222
   ```

2. **List available targets:**
   Use the `list_electron_targets` tool to see all debuggable windows.

3. **Connect to a target:**
   Use `connect_to_electron_target` with the target ID.

4. **Inspect and interact:**
   Use DOM tools to query elements, execute JavaScript, etc.

## Examples

### Example 1: Click a Button in Electron App

```typescript
// 1. List targets
list_electron_targets()

// 2. Connect to target
connect_to_electron_target({ targetId: "..." })

// 3. Find button
query_selector({ targetId: "...", selector: "#submitButton" })

// 4. Click it via JavaScript
execute_javascript({ 
  targetId: "...", 
  code: "document.querySelector('#submitButton').click()" 
})
```

### Example 2: Automate Native UI

```typescript
// 1. Check permissions
check_all_permissions()

// 2. Move mouse and click
click({ x: 500, y: 300 })

// 3. Type text
type_text({ text: "Hello!" })

// 4. Press Enter
press_key({ key: "enter" })
```

### Example 3: Trigger Spotlight

```typescript
trigger_common_macos_hotkey({ hotkey: "spotlight" })
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format code
npm run format
```

## Architecture

```
electron-native-mcp/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP server setup
│   ├── types/                # TypeScript types
│   ├── lib/                  # Core libraries
│   │   ├── cdp-client.ts     # Chrome DevTools Protocol client
│   │   ├── accessibility.ts  # macOS accessibility wrapper
│   │   └── permissions.ts    # Permission manager
│   └── tools/                # MCP tools
│       ├── dom/              # DOM inspection tools
│       ├── ui/               # UI automation tools
│       ├── hotkey/           # Hotkey tools
│       └── permissions/      # Permission tools
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Permission Denied Errors

If you get permission errors, use the permission tools to check status:

```typescript
check_all_permissions()
get_permission_instructions({ permission: "accessibility" })
```

Then grant the required permissions in System Settings.

### Cannot Connect to Electron App

Make sure your Electron app is running with the `--inspect` flag:

```bash
your-app --inspect=9222
```

### Screenshots Not Working

Ensure Screen Recording permission is granted for your terminal app (Terminal, iTerm2, VS Code, etc.).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Built with:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) - MCP TypeScript SDK
- [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface) - Chrome DevTools Protocol client
- [@nut-tree/nut-js](https://github.com/nut-tree/nut.js) - Desktop automation
- [node-mac-permissions](https://github.com/codebytere/node-mac-permissions) - macOS permissions

