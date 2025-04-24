#!/usr/bin/env node

import { main } from '../server/index.js';

// Run the MCP server
main().catch(err => {
  console.error('Error starting MCP server:', err);
  process.exit(1);
}); 