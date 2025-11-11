#!/bin/bash

# Electron Native MCP Server Setup Script

set -e

echo "🚀 Electron Native MCP Server Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18 or later from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later is required"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This server only supports macOS"
    exit 1
fi

echo "✅ macOS detected"
echo ""

# Check for Xcode Command Line Tools
if ! xcode-select -p &> /dev/null; then
    echo "⚠️  Xcode Command Line Tools not found"
    echo "Installing Xcode Command Line Tools..."
    xcode-select --install
    echo "Please complete the installation and run this script again"
    exit 1
fi

echo "✅ Xcode Command Line Tools installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Get the absolute path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📝 Configuration"
echo "================"
echo ""
echo "Add this to your Claude Desktop config:"
echo "File: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"electron-native\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"$PROJECT_DIR/dist/index.js\"]"
echo "    }"
echo "  }"
echo "}"
echo ""

# Check permissions
echo "🔐 Checking macOS Permissions"
echo "=============================="
echo ""
echo "This server requires the following permissions:"
echo ""
echo "1. Accessibility"
echo "   → System Settings → Privacy & Security → Accessibility"
echo "   → Add your terminal app (Terminal, iTerm2, VS Code, etc.)"
echo ""
echo "2. Screen Recording"
echo "   → System Settings → Privacy & Security → Screen Recording"
echo "   → Add your terminal app"
echo ""
echo "3. Input Monitoring"
echo "   → System Settings → Privacy & Security → Input Monitoring"
echo "   → Add your terminal app"
echo ""
echo "You can check permission status using the 'check_all_permissions' tool"
echo ""

# Offer to install example app
echo "📱 Example Electron App"
echo "======================="
echo ""
read -p "Would you like to install the example Electron app? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing example app..."
    cd "$PROJECT_DIR/examples/test-electron-app"
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Example app installed"
        echo ""
        echo "To run the example app:"
        echo "  cd examples/test-electron-app"
        echo "  npm start"
    else
        echo "❌ Failed to install example app"
    fi
    
    cd "$PROJECT_DIR"
fi

echo ""
echo "✨ Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Add the configuration to Claude Desktop (see above)"
echo "2. Grant the required macOS permissions"
echo "3. Restart Claude Desktop"
echo "4. Test with the example Electron app"
echo ""
echo "For more information, see:"
echo "  - README.md - Overview and features"
echo "  - USAGE.md - Detailed usage guide"
echo "  - IMPLEMENTATION.md - Technical details"
echo ""
echo "Happy automating! 🎉"

