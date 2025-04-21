#!/usr/bin/env node

import { main } from '../server/index.js';

main().catch((error: any) => {
  console.error('Failed to start Futarchy MCP server:', error);
  process.exit(1);
}); 