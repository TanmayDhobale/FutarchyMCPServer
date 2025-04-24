import { getProposalSentimentAnalysis } from './mcp/common/sentiment-service.js';

// Mock proposal data (similar to what we get from the getProposal endpoint)
const proposalData = {
  "number": 1,
  "proposer": "613BRiXuAEn7vibs2oAYzpGW9fXgjzDNuFMM4wPzLdY",
  "descriptionUrl": "https://example.com/proposal",
  "slotEnqueued": "1390bfa6",
  "state": {
    "failed": {}
  },
  "instruction": {
    "programId": "autowMzCbM29YXMgVG3T62Hkgo7RcyrvgQQkd54fDQL",
    "accounts": [
      {
        "pubkey": "F3hsZzWinRAHbr6CUxdkUFBCH8qNk6Mi9Zfu3PMX49BC",
        "isSigner": true,
        "isWritable": true
      }
    ],
    "data": {
      "type": "Buffer",
      "data": [131, 72, 75, 25, 112, 210, 109, 2, 1]
    }
  },
  "passAmm": "FxC4UcAJjJWRhq6zFwrwsk3EBrhahJGZyqv3SrFFQHs4",
  "failAmm": "Fj8qCBB2EG8rNE6jS98qGjjEFD26D6uExQe1yyDV1hhc",
  "baseVault": "FNrneRjDFe7TEHSnovU6jHVgoYRnVLwXqe2aWKjFvVkE",
  "quoteVault": "12AVXjbUy71eZS5nSEALSwtxjDX8786WTKVAsxzpvuzH",
  "dao": "F3hsZzWinRAHbr6CUxdkUFBCH8qNk6Mi9Zfu3PMX49BC",
  "passLpTokensLocked": "02540be400",
  "failLpTokensLocked": "02540be400",
  "nonce": "5d5a04daa6be",
  "pdaBump": 255,
  "question": "3jVzcQAuaT99mwwdYU4D5ECZknnKnuMJb8swrKkePyzY",
  "durationInSlots": "09e340"
};

// Demonstrate the combined data
async function demonstrateCombinedData() {
  try {
    const proposalId = "EV7WHwyo1H4XByhznMZLRGo32PZ4C5dwQEv8uPGN8VW8";
    console.log("Getting sentiment analysis for proposal:", proposalId);
    
    const sentimentAnalysis = await getProposalSentimentAnalysis(proposalId);
    
    // Combine proposal data with sentiment analysis (simulating what our updated API would do)
    const combinedData = {
      ...proposalData,
      sentimentAnalysis
    };
    
    console.log("Combined Proposal Data with Sentiment Analysis:");
    console.log(JSON.stringify(combinedData, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the demonstration
demonstrateCombinedData(); 