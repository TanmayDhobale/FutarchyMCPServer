import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { FutarchyApiClient } from '../common/api.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Diagnostic logging
try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    console.error("Server directory:", __dirname);
    const possibleRoutesLocations = [
        path.resolve(__dirname, '../../../routes.json'),
        path.resolve(__dirname, '../../routes.json'),
        path.resolve(__dirname, '../routes.json'),
        path.resolve(__dirname, './routes.json'),
        '/Users/tanmaydhobale/code/heyai-backend/futarchy-routes/routes.json',
        '/Users/tanmaydhobale/Desktop/futarchy-routes/routes.json'
    ];
    for (const routePath of possibleRoutesLocations) {
        try {
            if (fs.existsSync(routePath)) {
                const routesContent = fs.readFileSync(routePath, 'utf8');
                console.error(`Found routes.json at ${routePath}:`);
                console.error(routesContent);
            }
            else {
                console.error(`No routes.json found at ${routePath}`);
            }
        }
        catch (e) {
            console.error(`Error checking ${routePath}:`, e);
        }
    }
}
catch (e) {
    console.error("Diagnostic error:", e);
}
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
server.tool("getDaos", "Get all DAOs from the Futarchy system", {}, async () => {
    try {
        const response = await apiClient.getDaos();
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching DAOs: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
server.tool("getDao", "Get a specific DAO by ID", {
    daoId: z.string().describe("The ID of the DAO to retrieve"),
}, async ({ daoId }) => {
    try {
        const response = await apiClient.getDao(daoId);
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching DAO: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
server.tool("getProposals", "Get all proposals for a specific DAO", {
    daoId: z.string().describe("The ID of the DAO to get proposals for"),
}, async ({ daoId }) => {
    try {
        const response = await apiClient.getProposals(daoId);
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching proposals: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
server.tool("getProposal", "Get a specific proposal by ID", {
    proposalId: z.string().describe("The ID of the proposal to retrieve"),
}, async ({ proposalId }) => {
    try {
        const response = await apiClient.getProposal(proposalId);
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching proposal: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
server.tool("createProposal", "Create a new proposal for a DAO", {
    daoId: z.string().describe("The ID of the DAO to create a proposal for"),
    descriptionUrl: z.string().describe("URL to the proposal description"),
    baseTokensToLP: z.number().describe("Amount of base tokens to LP"),
    quoteTokensToLP: z.number().describe("Amount of quote tokens to LP"),
}, async (params) => {
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
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating proposal: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
// Add sentiment analysis tool
server.tool("getProposalSentiment", "Get sentiment analysis for a specific proposal based on Discord and Twitter data", {
    proposalId: z.string().describe("The ID of the proposal to analyze"),
}, async ({ proposalId }) => {
    try {
        const response = await apiClient.getProposalSentimentAnalysis(proposalId);
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching sentiment analysis for proposal: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
// Add trading tools
server.tool("buyInPassMarket", "Buy tokens in the pass market for a proposal", {
    proposalId: z.string().describe("The ID of the proposal to trade in"),
    amount: z.number().describe("Amount to buy"),
    user: z.string().describe("User's public key"),
}, async ({ proposalId, amount, user }) => {
    try {
        const response = await apiClient.buyInPassMarket(proposalId, amount, user);
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error buying in pass market: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
server.tool("sellInPassMarket", "Sell tokens in the pass market for a proposal", {
    proposalId: z.string().describe("The ID of the proposal to trade in"),
    amount: z.number().describe("Amount to sell"),
    user: z.string().describe("User's public key"),
}, async ({ proposalId, amount, user }) => {
    try {
        const response = await apiClient.sellInPassMarket(proposalId, amount, user);
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error selling in pass market: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
server.tool("buyInFailMarket", "Buy tokens in the fail market for a proposal", {
    proposalId: z.string().describe("The ID of the proposal to trade in"),
    amount: z.number().describe("Amount to buy"),
    user: z.string().describe("User's public key"),
}, async ({ proposalId, amount, user }) => {
    try {
        const response = await apiClient.buyInFailMarket(proposalId, amount, user);
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error buying in fail market: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
server.tool("sellInFailMarket", "Sell tokens in the fail market for a proposal", {
    proposalId: z.string().describe("The ID of the proposal to trade in"),
    amount: z.number().describe("Amount to sell"),
    user: z.string().describe("User's public key"),
}, async ({ proposalId, amount, user }) => {
    try {
        const response = await apiClient.sellInFailMarket(proposalId, amount, user);
        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: response.error || 'Unknown error',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error selling in fail market: ${error.message || 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
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
    }
    catch (error) {
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
