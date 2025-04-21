#!/bin/bash

# Exit on error
set -e

echo "Setting up Futarchy MCP Server..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Create MCP configuration directory if it doesn't exist
mkdir -p ~/.cursor

# Create or update mcp.json configuration
MCP_CONFIG=~/.cursor/mcp.json
PROJECT_PATH=$(pwd)

# Check if mcp.json exists and has content
if [ -s "$MCP_CONFIG" ]; then
  # Check if it's a valid JSON
  if ! jq empty "$MCP_CONFIG" 2>/dev/null; then
    echo "Existing mcp.json is not valid JSON. Creating a new one..."
    echo "{\"mcpServers\": {\"futarchy-routes\": {\"command\": \"node\", \"args\": [\"$PROJECT_PATH/dist/mcp/bin/mcp-futarchy.js\"]}}}" > "$MCP_CONFIG"
  else
    # If it's valid JSON, update it
    echo "Updating existing mcp.json..."
    if ! jq '.mcpServers."futarchy-routes" = {"command": "node", "args": ["'"$PROJECT_PATH"'/dist/mcp/bin/mcp-futarchy.js"]}' "$MCP_CONFIG" > "$MCP_CONFIG.tmp"; then
      echo "Error updating mcp.json. Creating a new one..."
      echo "{\"mcpServers\": {\"futarchy-routes\": {\"command\": \"node\", \"args\": [\"$PROJECT_PATH/dist/mcp/bin/mcp-futarchy.js\"]}}}" > "$MCP_CONFIG"
    else
      mv "$MCP_CONFIG.tmp" "$MCP_CONFIG"
    fi
  fi
else
  # If mcp.json doesn't exist or is empty, create it
  echo "Creating new mcp.json..."
  echo "{\"mcpServers\": {\"futarchy-routes\": {\"command\": \"node\", \"args\": [\"$PROJECT_PATH/dist/mcp/bin/mcp-futarchy.js\"]}}}" > "$MCP_CONFIG"
fi

echo "MCP configuration updated at $MCP_CONFIG"
echo "Setup complete! You can now use the Futarchy MCP server in Cursor."
echo "To start the server manually, run: npm run mcp" 