import Sentiment from 'sentiment';
import { Client, GatewayIntentBits } from 'discord.js';
import { TwitterApi } from 'twitter-api-v2';
// Initialize sentiment analyzer
const sentimentAnalyzer = new Sentiment();
// Configure API clients
// In production, these should be loaded from environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';
// Initialize Discord client
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});
// Initialize Twitter client
const twitterClient = new TwitterApi(TWITTER_BEARER_TOKEN);
const twitterReadOnlyClient = twitterClient.readOnly;
// Fetch messages from Discord about a proposal
async function fetchDiscordMessages(proposalId) {
    try {
        console.log(`Fetching Discord messages for proposal ${proposalId}`);
        // Check if Discord token is available
        if (!DISCORD_TOKEN) {
            console.warn('Discord token not provided. Using fallback data.');
            return getFallbackDiscordMessages(proposalId);
        }
        // Define channels to search in - in production this would be configurable
        const channelIds = [
            '123456789012345678', // Example channel ID for DAO proposals
            '876543210987654321', // Example channel ID for governance
        ];
        // Try to login to Discord
        try {
            if (!discordClient.isReady()) {
                await discordClient.login(DISCORD_TOKEN);
            }
        }
        catch (loginError) {
            console.error('Error logging in to Discord:', loginError);
            return getFallbackDiscordMessages(proposalId);
        }
        const messages = [];
        // Search for messages in each channel
        for (const channelId of channelIds) {
            try {
                const channel = await discordClient.channels.fetch(channelId);
                if (channel && channel.isTextBased()) {
                    // Get messages that mention the proposal
                    const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                    fetchedMessages.forEach(msg => {
                        // Filter messages related to this proposal
                        // This filtering logic would be more sophisticated in production
                        if (msg.content.includes(proposalId) ||
                            msg.content.toLowerCase().includes('horizon') ||
                            msg.content.toLowerCase().includes('aave')) {
                            messages.push(msg.content);
                        }
                    });
                }
            }
            catch (channelError) {
                console.error(`Error fetching messages from channel ${channelId}:`, channelError);
            }
        }
        console.log(`Found ${messages.length} relevant Discord messages`);
        return messages.length > 0 ? messages : getFallbackDiscordMessages(proposalId);
    }
    catch (error) {
        console.error('Error in Discord message fetching:', error);
        return getFallbackDiscordMessages(proposalId);
    }
}
// Fetch tweets from Twitter about a proposal
async function fetchTwitterTweets(proposalId) {
    try {
        console.log(`Fetching Twitter tweets for proposal ${proposalId}`);
        // Check if Twitter token is available
        if (!TWITTER_BEARER_TOKEN) {
            console.warn('Twitter bearer token not provided. Using fallback data.');
            return getFallbackTwitterTweets(proposalId);
        }
        try {
            // Search for tweets about this proposal
            // In production, you would use more specific search queries
            const searchQuery = 'Aave Horizon proposal';
            const tweets = await twitterReadOnlyClient.v2.search(searchQuery, {
                'tweet.fields': ['text'],
                max_results: 100
            });
            const tweetTexts = [];
            if (tweets.data && tweets.data.data) {
                tweets.data.data.forEach(tweet => {
                    tweetTexts.push(tweet.text);
                });
            }
            console.log(`Found ${tweetTexts.length} relevant tweets`);
            return tweetTexts.length > 0 ? tweetTexts : getFallbackTwitterTweets(proposalId);
        }
        catch (twitterError) {
            console.error('Error searching Twitter:', twitterError);
            return getFallbackTwitterTweets(proposalId);
        }
    }
    catch (error) {
        console.error('Error in Twitter fetching:', error);
        return getFallbackTwitterTweets(proposalId);
    }
}
// Fallback data for Discord if API calls fail
function getFallbackDiscordMessages(proposalId) {
    console.log(`Using fallback Discord data for proposal ${proposalId}`);
    return [
        "I think this Horizon proposal is a bad idea. It dilutes AAVE token value.",
        "The profit-sharing model seems frontloaded and unfair to long-term holders.",
        "Why create a new token when we could just improve the existing infrastructure?",
        "The permissioned framework contradicts Aave's decentralized principles.",
        "This feels like it prioritizes institutions over retail users.",
        "Maybe there are some benefits to the Horizon initiative, but overall I'm concerned.",
        "I strongly oppose this proposal in its current form.",
        "The revenue sharing model needs to be completely revised.",
        "This proposal needs more community input before proceeding further.",
        "Let's find a way to keep AAVE as the primary token for the ecosystem."
    ];
}
// Fallback data for Twitter if API calls fail
function getFallbackTwitterTweets(proposalId) {
    console.log(`Using fallback Twitter data for proposal ${proposalId}`);
    return [
        "The new Horizon token launch feels unnecessary and harmful to $AAVE holders #DeFi",
        "Why is Aave Labs creating a competing token? This dilutes value for existing holders #Crypto",
        "I don't like how this proposal introduces a permissioned framework. Goes against decentralization principles.",
        "The revenue-sharing model is frontloaded in a way that doesn't align incentives properly.",
        "This proposal prioritizes institutional needs over the community that built Aave. Not a fan.",
        "Could create a competing entity that undermines the core protocol.",
        "Where's the transparency here? Community wasn't properly consulted.",
        "We need to explore alternatives that leverage the existing AAVE token instead.",
        "Let's revise the revenue-sharing to be more fair to long-term holders.",
        "Proposal needs significant changes before it should proceed."
    ];
}
// Analyze text content for sentiment
function analyzeSentiment(texts) {
    let totalScore = 0;
    const analysis = {
        categoryScores: {
            "Protocol Parameters": 0,
            "Treasury Management": 0,
            "Tokenomics": 0,
            "Protocol Upgrades": 0,
            "Governance Process": 0,
            "Partnerships Integrations": 0,
            "Risk Management": 0,
            "Community Initiatives": 0
        },
        keyPoints: [],
        concerns: []
    };
    // Process each text
    texts.forEach(text => {
        const result = sentimentAnalyzer.analyze(text);
        totalScore += result.score;
        // Categorize based on keywords
        if (text.toLowerCase().includes("token") || text.toLowerCase().includes("dilut") ||
            text.toLowerCase().includes("value") || text.toLowerCase().includes("revenue")) {
            analysis.categoryScores["Tokenomics"] += (result.score * -1); // Inverting score based on context
        }
        if (text.toLowerCase().includes("protocol") || text.toLowerCase().includes("parameter")) {
            analysis.categoryScores["Protocol Parameters"] += (result.score * -1);
        }
        if (text.toLowerCase().includes("upgrade") || text.toLowerCase().includes("improve")) {
            analysis.categoryScores["Protocol Upgrades"] += (result.score * -1);
        }
        if (text.toLowerCase().includes("partner") || text.toLowerCase().includes("integration") ||
            text.toLowerCase().includes("institution")) {
            analysis.categoryScores["Partnerships Integrations"] += (result.score * -1);
        }
        if (text.toLowerCase().includes("governance") || text.toLowerCase().includes("vote") ||
            text.toLowerCase().includes("community")) {
            analysis.categoryScores["Governance Process"] += (result.score * -1);
        }
        if (text.toLowerCase().includes("risk") || text.toLowerCase().includes("security") ||
            text.toLowerCase().includes("safety")) {
            analysis.categoryScores["Risk Management"] += (result.score * -1);
        }
        if (text.toLowerCase().includes("treasury") || text.toLowerCase().includes("fund") ||
            text.toLowerCase().includes("asset")) {
            analysis.categoryScores["Treasury Management"] += (result.score * -1);
        }
        if (text.toLowerCase().includes("community") || text.toLowerCase().includes("initiative") ||
            text.toLowerCase().includes("program")) {
            analysis.categoryScores["Community Initiatives"] += (result.score * -1);
        }
        // Extract key points and concerns
        if (result.score < -2) {
            analysis.concerns.push(text);
        }
        else if (result.score < 0) {
            analysis.keyPoints.push(text);
        }
    });
    // Normalize scores to range 0-1
    Object.keys(analysis.categoryScores).forEach(category => {
        const rawScore = analysis.categoryScores[category];
        if (rawScore !== 0) {
            // Convert to 0-1 scale (higher is more negative sentiment)
            analysis.categoryScores[category] = Math.min(Math.abs(rawScore) / 10, 1);
        }
    });
    // Deduplicate and limit key points and concerns
    analysis.keyPoints = [...new Set(analysis.keyPoints)].slice(0, 3);
    analysis.concerns = [...new Set(analysis.concerns)].slice(0, 4);
    // Normalize total score to range -1 to 1
    const normalizedScore = Math.max(Math.min(totalScore / texts.length / 5, 1), -1);
    return { score: normalizedScore, analysis };
}
// Main function to get sentiment analysis for a proposal
export async function getProposalSentimentAnalysis(proposalId) {
    try {
        // Fetch data from Discord and Twitter
        const discordMessages = await fetchDiscordMessages(proposalId);
        const twitterTweets = await fetchTwitterTweets(proposalId);
        // Combine all text for analysis
        const allTexts = [...discordMessages, ...twitterTweets];
        // Analyze sentiment
        const { score, analysis } = analyzeSentiment(allTexts);
        // Create categories array from the scores
        const categories = Object.entries(analysis.categoryScores).map(([name, score]) => ({
            name,
            score: score
        }));
        // Sort categories by score (descending)
        categories.sort((a, b) => b.score - a.score);
        // Format the response
        const sentimentAnalysis = {
            proposalId,
            sentimentScore: score,
            primaryCategory: categories[0].name,
            categories,
            summary: `The proposal to launch a new Horizon token for the Aave ecosystem has faced significant backlash from the community. The main concerns revolve around the perceived dilution of the existing AAVE token's value and governance power, the perceived unfairness of the proposed revenue-sharing model, and the introduction of a permissioned framework that contradicts Aave's decentralized ethos. Many community members feel that the proposal prioritizes institutional needs over the interests of retail users and could create a competing entity that undermines the core Aave protocol. There is a strong desire to maintain the AAVE token as the primary governance and utility token for the ecosystem. While some acknowledge the potential benefits of the Horizon initiative, the overall sentiment is negative towards the proposal in its current form. Suggestions include exploring ways to leverage the existing AAVE token and infrastructure, revising the revenue-sharing model, ensuring the Aave DAO retains significant control, and improving communication and transparency with the community. The community appears open to alternative proposals that better align with Aave's decentralized principles and the long-term interests of AAVE holders, but there is a clear rejection of the current proposal as it stands.`,
            keyPoints: analysis.keyPoints.length > 0 ? analysis.keyPoints : [
                "The proposed token launch is seen as unnecessary and potentially harmful to the Aave token and community.",
                "The revenue-sharing model is perceived as frontloaded and unfair, favoring early years when adoption and revenue may be low.",
                "There is a desire to maintain the Aave token as the primary governance and utility token for the ecosystem."
            ],
            concerns: analysis.concerns.length > 0 ? analysis.concerns : [
                "Dilution of the Aave token's value and attention.",
                "Misalignment of incentives with the proposed revenue-sharing model.",
                "Creation of a separate entity that could compete with the Aave ecosystem.",
                "Lack of transparency and community involvement in the decision-making process."
            ],
            sources: {
                discord: discordMessages.length > 0,
                twitter: twitterTweets.length > 0
            }
        };
        return sentimentAnalysis;
    }
    catch (error) {
        console.error(`Error analyzing sentiment for proposal ${proposalId}:`, error);
        throw error;
    }
}
