#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the routes.json path
const routesJsonPath = path.resolve(__dirname, '../../../routes.json');

// Define the updated routes
const updatedRoutes = {
  "mcp_futarchy_routes_getDaos": {},
  "mcp_futarchy_routes_getDao": {
    "daoId": "string"
  },
  "mcp_futarchy_routes_getProposals": {
    "daoId": "string"
  },
  "mcp_futarchy_routes_getProposal": {
    "proposalId": "string" 
  },
  "mcp_futarchy_routes_createProposal": {
    "daoId": "string",
    "descriptionUrl": "string",
    "baseTokensToLP": "number",
    "quoteTokensToLP": "number"
  },
  "mcp_futarchy_routes_getProposalSentiment": {
    "proposalId": "string"
  },
  "mcp_futarchy_routes_buyInPassMarket": {
    "proposalId": "string",
    "amount": "number",
    "user": "string"
  },
  "mcp_futarchy_routes_sellInPassMarket": {
    "proposalId": "string",
    "amount": "number",
    "user": "string"
  },
  "mcp_futarchy_routes_buyInFailMarket": {
    "proposalId": "string",
    "amount": "number",
    "user": "string"
  },
  "mcp_futarchy_routes_sellInFailMarket": {
    "proposalId": "string",
    "amount": "number",
    "user": "string"
  }
};

// Write the updated routes to routes.json
try {
  fs.writeFileSync(routesJsonPath, JSON.stringify(updatedRoutes, null, 2));
  console.log(`Routes updated successfully. Written to ${routesJsonPath}`);
} catch (error) {
  console.error('Failed to update routes.json:', error);
  process.exit(1);
} 