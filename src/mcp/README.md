# Futarchy-Routes MCP Server

This is a Model Context Protocol (MCP) server for the Futarchy Routes backend. It allows Cursor to interact with the Futarchy protocol on Solana through a set of defined tools.

## Installation

1. Install the necessary dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Configure the MCP server in Cursor:
   - Open or create `~/.cursor/mcp.json`
   - Add the following configuration:
   ```json
   {
     "mcpServers": {
       "futarchy-routes": {
         "command": "node",
         "args": ["<absolute-path-to-project>/dist/mcp/bin/mcp-futarchy.js"]
       }
     }
   }
   ```
   - Replace `<absolute-path-to-project>` with the absolute path to your futarchy-routes directory.

## Running the Servers

To use the Futarchy tools, you need to start two servers:

1. **Futarchy Backend Server**:
   
   Navigate to the futarchy-routes directory and run:
   ```bash
   npm run build && npm run start
   ```
   
   You should see output like:
   ```
   > futarchy-mcp@1.0.0 build
   > tsc
   
   > futarchy-mcp@1.0.0 start
   > node dist/server.js
   
   Server is running on port 9000
   ```
   
   This server handles the API requests to the Futarchy protocol.

2. **MCP Server**:
   
   In a separate terminal, navigate to your futarchy-routes directory and run:
   ```bash
   node dist/mcp/bin/mcp-futarchy.js
   ```
   
   You should see:
   ```
   Futarchy MCP Server running on stdio
   ```
   
   This server enables the Cursor tools to communicate with the Futarchy backend.

Both servers must be running for the tools to work correctly.

## Available Tools

The following tools are available through the MCP server:

1. `getDaos` - Get all DAOs from the Futarchy system
2. `getDao` - Get a specific DAO by ID
3. `getProposals` - Get all proposals for a specific DAO
4. `getProposal` - Get a specific proposal by ID
5. `createProposal` - Create a new proposal for a DAO

## Usage in Cursor

You can use these tools in Cursor's chat by mentioning the tool names in your prompt. For example:

```
Use the getDaos tool to retrieve a list of all DAOs from the futarchy-routes backend.
```

or 

```
Use the getDao tool with daoId="your-dao-id" to retrieve details of a specific DAO.
```

## Development

To make changes to the MCP server:

1. Modify the tools in `src/mcp/server/index.ts`
2. Update the API client in `src/mcp/common/api.ts` if needed
3. Build the project:
```bash
npm run build
```
4. Restart the server in Cursor

## Troubleshooting

If you encounter issues with the MCP server:

1. Check the console logs for error messages
2. Verify that the Futarchy backend server is running on the expected port (default: 9000)
3. Make sure the configuration in `~/.cursor/mcp.json` is correct
4. Try restarting Cursor
5. Ensure both the Futarchy backend server and MCP server are running

## License

ISC 

