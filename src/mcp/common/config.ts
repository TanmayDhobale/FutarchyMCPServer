import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env file
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  console.log('Loading environment from .env file');
  dotenv.config({ path: envPath });
}

// Discord configuration
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
export const DISCORD_CHANNEL_IDS = process.env.DISCORD_CHANNEL_IDS 
  ? process.env.DISCORD_CHANNEL_IDS.split(',').map(id => id.trim())
  : ['123456789012345678', '876543210987654321']; // Default values if not specified

// Twitter configuration
export const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';
export const TWITTER_SEARCH_QUERY = process.env.TWITTER_SEARCH_QUERY || 'Aave Horizon proposal';

// Log configuration status (without exposing actual tokens)
export function logConfigStatus() {
  console.log('Configuration status:');
  console.log(`- Discord token: ${DISCORD_TOKEN ? 'Provided ✓' : 'Missing ✗'}`);
  console.log(`- Discord channels: ${DISCORD_CHANNEL_IDS.length} channels configured`);
  console.log(`- Twitter token: ${TWITTER_BEARER_TOKEN ? 'Provided ✓' : 'Missing ✗'}`);
  console.log(`- Twitter search query: "${TWITTER_SEARCH_QUERY}"`);
} 