import { z } from 'zod';
// Common response type
export const ResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional(),
});
// DAO types
export const DaoSchema = z.object({
    address: z.string(),
    tokenMint: z.string(),
    usdcMint: z.string(),
    // Add other DAO fields as needed
});
// Proposal types
export const ProposalSchema = z.object({
    address: z.string(),
    dao: z.string(),
    descriptionUrl: z.string(),
    // Add other proposal fields as needed
});
// Sentiment analysis types
export const SentimentCategorySchema = z.object({
    name: z.string(),
    score: z.number(),
});
export const SentimentAnalysisSchema = z.object({
    proposalId: z.string(),
    sentimentScore: z.number(),
    primaryCategory: z.string(),
    categories: z.array(SentimentCategorySchema),
    summary: z.string(),
    keyPoints: z.array(z.string()),
    concerns: z.array(z.string()),
    sources: z.object({
        discord: z.boolean(),
        twitter: z.boolean(),
    }),
});
// Tool parameter schemas
export const GetDaosParamsSchema = z.object({});
export const GetDaoParamsSchema = z.object({
    daoId: z.string().describe("The ID of the DAO to retrieve"),
});
export const GetProposalsParamsSchema = z.object({
    daoId: z.string().describe("The ID of the DAO to get proposals for"),
});
export const GetProposalParamsSchema = z.object({
    proposalId: z.string().describe("The ID of the proposal to retrieve"),
});
export const CreateProposalParamsSchema = z.object({
    daoId: z.string().describe("The ID of the DAO to create a proposal for"),
    descriptionUrl: z.string().describe("URL to the proposal description"),
    baseTokensToLP: z.number().describe("Amount of base tokens to LP"),
    quoteTokensToLP: z.number().describe("Amount of quote tokens to LP"),
});
export const GetSentimentAnalysisParamsSchema = z.object({
    proposalId: z.string().describe("The ID of the proposal to analyze"),
});
