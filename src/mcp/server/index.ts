import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { FutarchyApiClient } from '../common/api.js';
import { z } from 'zod';

// Create an API client
const apiClient = new FutarchyApiClient();

// Create the MCP server
const server = new McpServer({
  name: "futarchy-routes",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {}
  }
});

// Define tools
server.tool(
  "getDaos",
  "Get all DAOs from the Futarchy system",
  {},
  async () => {
    try {
      const response = await apiClient.getDaos();
      
      if (!response.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: response.error || 'Unknown error',
            },
          ],
          isError: true,
        };
      }
      
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching DAOs: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "getDao",
  "Get a specific DAO by ID",
  {
    daoId: z.string().describe("The ID of the DAO to retrieve"),
  },
  async ({ daoId }) => {
    try {
      const response = await apiClient.getDao(daoId);
      
      if (!response.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: response.error || 'Unknown error',
            },
          ],
          isError: true,
        };
      }
      
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching DAO: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "getProposals",
  "Get all proposals for a specific DAO",
  {
    daoId: z.string().describe("The ID of the DAO to get proposals for"),
  },
  async ({ daoId }) => {
    try {
      const response = await apiClient.getProposals(daoId);
      
      if (!response.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: response.error || 'Unknown error',
            },
          ],
          isError: true,
        };
      }
      
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching proposals: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "getProposal",
  "Get a specific proposal by ID",
  {
    proposalId: z.string().describe("The ID of the proposal to retrieve"),
  },
  async ({ proposalId }) => {
    try {
      const response = await apiClient.getProposal(proposalId);
      
      if (!response.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: response.error || 'Unknown error',
            },
          ],
          isError: true,
        };
      }
      
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching proposal: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "createProposal",
  "Create a new proposal for a DAO",
  {
    daoId: z.string().describe("The ID of the DAO to create a proposal for"),
    descriptionUrl: z.string().describe("URL to the proposal description"),
    baseTokensToLP: z.number().describe("Amount of base tokens to LP"),
    quoteTokensToLP: z.number().describe("Amount of quote tokens to LP"),
  },
  async (params) => {
    try {
      const response = await apiClient.createProposal({
        daoId: params.daoId,
        descriptionUrl: params.descriptionUrl,
        baseTokensToLP: params.baseTokensToLP,
        quoteTokensToLP: params.quoteTokensToLP
      });
      
      if (!response.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: response.error || 'Unknown error',
            },
          ],
          isError: true,
        };
      }
      
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating proposal: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Main function to start the server
export async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Futarchy MCP Server running on stdio");
    
    // Handle process termination
    process.on('SIGINT', async () => {
      console.error('Received SIGINT, shutting down...');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.error('Received SIGTERM, shutting down...');
      process.exit(0);
    });

    return server;
  } catch (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
  }
}

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
} 