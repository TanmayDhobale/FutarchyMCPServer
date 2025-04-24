// Direct test of the sentiment analysis service
// Run with: node --experimental-modules dist/mcp/common/sentiment-service-test.js

import { getProposalSentimentAnalysis } from '../dist/mcp/common/sentiment-service.js';

async function testSentimentAnalysis() {
  try {
    const proposalId = "EV7WHwyo1H4XByhznMZLRGo32PZ4C5dwQEv8uPGN8VW8";
    console.log("Getting sentiment analysis for proposal:", proposalId);
    
    const sentimentAnalysis = await getProposalSentimentAnalysis(proposalId);
    
    console.log("Sentiment Analysis Results:");
    console.log(JSON.stringify(sentimentAnalysis, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the test
testSentimentAnalysis(); 