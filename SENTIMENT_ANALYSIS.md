# Sentiment Analysis for Futarchy Proposals

This document explains how to set up and use the sentiment analysis feature with real Discord and Twitter data.

## Overview

The sentiment analysis tool analyzes messages from Discord and tweets from Twitter related to proposals in the Futarchy system. It uses natural language processing to:

1. Determine the overall sentiment (positive, neutral, negative)
2. Categorize feedback into different areas (Tokenomics, Governance, etc.)
3. Extract key points and concerns
4. Present the data in a structured format

## Setting Up Discord API

To use real Discord data:

1. Create a Discord application at https://discord.com/developers/applications
2. Create a bot for your application
3. Enable the following "Privileged Gateway Intents":
   - Server Members Intent
   - Message Content Intent
4. Add the bot to your Discord server with appropriate permissions
5. Copy the bot token

## Setting Up Twitter API

To use real Twitter data:

1. Sign up for a Twitter Developer account at https://developer.twitter.com/
2. Create a project and app
3. Apply for Elevated access if you need higher API limits
4. Generate a Bearer Token for your app
5. Copy the Bearer Token

## Configuration

Set your API tokens as environment variables:

```bash
export DISCORD_TOKEN=your_discord_token
export TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

Or use the provided npm script:

```bash
# Edit package.json first to add your tokens
npm run mcp:prod
```

## Usage in Production

In a production environment:

1. Store API tokens securely (e.g., environment variables, secrets manager)
2. Implement proper error handling and rate limiting
3. Set up monitoring for API quota usage
4. Consider caching results to minimize API calls

## Customization

You can customize the sentiment analysis by:

1. Adjusting the channel IDs in the Discord client
2. Modifying the search query for Twitter
3. Tuning the categorization logic for different proposal types
4. Adding additional data sources

## Fallback Mechanism

The system includes a fallback mechanism that uses pre-defined mock data if:

1. API tokens are not provided
2. API calls fail
3. No relevant messages/tweets are found

This ensures the sentiment analysis always returns useful information even if the APIs are unavailable. 