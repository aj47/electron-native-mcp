# Test Electron App

A simple Electron application for testing the Electron Native MCP Server.

## Setup

```bash
cd examples/test-electron-app
npm install
```

## Running

```bash
# Start with debugging enabled on port 9222
npm start

# Start with debugging paused (waits for debugger to attach)
npm run start-debug
```

## Testing with MCP Server

Once the app is running, you can use the MCP server to interact with it:

### 1. List Available Targets

```typescript
list_electron_targets()
```

This will show all debuggable windows, including this test app.

### 2. Connect to the App

```typescript
connect_to_electron_target({ targetId: "..." })
```

### 3. Try DOM Queries

```typescript
// Find the "Click Me!" button
query_selector({ 
  targetId: "...", 
  selector: "#clickMe" 
})

// Get all buttons
query_selector_all({ 
  targetId: "...", 
  selector: "button" 
})
```

### 4. Execute JavaScript

```typescript
// Click a button
execute_javascript({ 
  targetId: "...", 
  code: "document.getElementById('clickMe').click()" 
})

// Get input value
execute_javascript({ 
  targetId: "...", 
  code: "document.getElementById('textInput').value" 
})

// Change text
execute_javascript({ 
  targetId: "...", 
  code: "document.getElementById('textInput').value = 'Hello from MCP!'" 
})
```

### 5. Take Screenshots

```typescript
take_electron_screenshot({ targetId: "..." })
```

## Features

This test app includes:

- Multiple interactive buttons
- Text input field
- Output log
- Dynamic styling
- Event handlers

All elements have IDs for easy querying and testing.

