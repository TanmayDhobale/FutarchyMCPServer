# Futarchy MCP

A server implementation for interacting with the Futarchy protocol on Solana.

<a href="https://glama.ai/mcp/servers/@TanmayDhobale/FutarchyMCPServer">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@TanmayDhobale/FutarchyMCPServer/badge" alt="Futarchy Server MCP server" />
</a>

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

## Sentiment Analysis Feature

The Futarchy MCP Server now includes a sentiment analysis tool that analyzes sentiment from Discord and Twitter data for specific proposals. This feature helps in understanding community sentiment about proposals and can be used to make more informed decisions.

### How It Works

1. The sentiment analysis tool collects data from Discord and Twitter about a specific proposal.
2. It analyzes the sentiment using natural language processing techniques.
3. It categorizes the sentiment into different categories (Tokenomics, Protocol Parameters, etc.).
4. It generates a summary, key points, and concerns based on the analysis.
5. The results are presented in a structured format that can be easily consumed by frontends.

### Example Response

```json
{
  "proposalId": "F3hsZzWinRAHbr6CUxdkUFBCH8qNk6Mi9Zfu3PMX49BC",
  "sentimentScore": -0.8,
  "primaryCategory": "Tokenomics",
  "categories": [
    {
      "name": "Tokenomics",
      "score": 0.4
    },
    {
      "name": "Protocol Upgrades",
      "score": 0.3
    },
    {
      "name": "Partnerships Integrations",
      "score": 0.2
    },
    {
      "name": "Protocol Parameters",
      "score": 0.1
    }
  ],
  "summary": "The proposal to launch a new Horizon token for the Aave ecosystem has faced significant backlash from the community...",
  "keyPoints": [
    "The proposed token launch is seen as unnecessary and potentially harmful to the Aave token and community.",
    "The revenue-sharing model is perceived as frontloaded and unfair, favoring early years when adoption and revenue may be low.",
    "There is a desire to maintain the Aave token as the primary governance and utility token for the ecosystem."
  ],
  "concerns": [
    "Dilution of the Aave token's value and attention.",
    "Misalignment of incentives with the proposed revenue-sharing model.",
    "Creation of a separate entity that could compete with the Aave ecosystem.",
    "Lack of transparency and community involvement in the decision-making process."
  ],
  "sources": {
    "discord": true,
    "twitter": true
  }
}
```

### How to Use

You can use the sentiment analysis tool in your MCP server as follows:

```javascript
const result = await mcp_futarchy_routes_getProposalSentiment({
  proposalId: "F3hsZzWinRAHbr6CUxdkUFBCH8qNk6Mi9Zfu3PMX49BC"
});
```

This will return the sentiment analysis for the specified proposal.