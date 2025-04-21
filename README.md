# Futarchy MCP

A server implementation for interacting with the Futarchy protocol on Solana.

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd futarchy-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Configure RPC URL:
   - Open `src/server.ts`
   - Update the RPC URL in the connection initialization:
   ```typescript
   const connection = new Connection('YOUR_RPC_URL_HERE');
   ```
   - You can use:
     - Mainnet: `https://api.mainnet-beta.solana.com`
     - Devnet: `https://api.devnet.solana.com`
     - Or your own RPC provider URL (works only with this)

4. Start the development server:
```bash
npm run dev
```

## Available Routes

### DAO Routes
- `GET /daos` - Get all DAOs
- `GET /daos/:id` - Get a specific DAO by ID
- `GET /daos/:id/proposals` - Get all proposals for a specific DAO
- `POST /daos/:id/proposals` - Create a new proposal for a DAO (not tested as of now because dao creation route does not exist)
  - Body:
    ```json
    {
      "descriptionUrl": "string",
      "baseTokensToLP": "number",
      "quoteTokensToLP": "number"
    }
    ```

### Proposal Routes
- `GET /proposals/:id` - Get a specific proposal by ID

## Testing
You can test the routes using tools like Postman or curl. The server runs on port 9000 by default.

Example curl commands:
```bash
# Get all DAOs
curl http://localhost:9000/daos

# Get a specific DAO
curl http://localhost:9000/daos/<dao-address>

# Get proposals for a DAO
curl http://localhost:9000/daos/<dao-address>/proposals

# Create a new proposal
curl -X POST http://localhost:9000/daos/<dao-address>/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "descriptionUrl": "https://example.com/proposal",
    "baseTokensToLP": 1000,
    "quoteTokensToLP": 1000
  }'
```

## MCP Server for Cursor

This project also includes an MCP (Model Context Protocol) server that allows Cursor to interact with the Futarchy backend through custom tools.

### Setting up the MCP Server

1. Run the setup script to install dependencies, build the project, and configure Cursor:
```bash
chmod +x setup.sh
./setup.sh
```

2. Or manually configure it:
   - Install dependencies and build the project:
   ```bash
   npm install
   npm run build
   ```
   - Open or create `~/.cursor/mcp.json`
   - Add the following configuration (adjust the path as needed):
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

### Using the MCP Server in Cursor

You can use the following tools in Cursor's chat:

1. `getDaos` - Get all DAOs from the Futarchy system
2. `getDao` - Get a specific DAO by ID
3. `getProposals` - Get all proposals for a specific DAO
4. `getProposal` - Get a specific proposal by ID
5. `createProposal` - Create a new proposal for a DAO

For example, in Cursor's chat, you can say:

```
Use the getDaos tool to retrieve a list of all DAOs from the futarchy-routes backend.
```

For more details about the MCP server, see [src/mcp/README.md](src/mcp/README.md). 