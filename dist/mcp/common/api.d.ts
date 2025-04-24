import { Response, CreateProposalParams } from './types.js';
export declare class FutarchyApiClient {
    private baseUrl;
    constructor(baseUrl?: string);
    getDaos(): Promise<Response>;
    getDao(daoId: string): Promise<Response>;
    getProposals(daoId: string): Promise<Response>;
    getProposal(proposalId: string): Promise<Response>;
    createProposal(params: CreateProposalParams): Promise<Response>;
    getProposalSentimentAnalysis(proposalId: string): Promise<Response>;
    buyInPassMarket(proposalId: string, amount: number, userPublicKey: string): Promise<Response>;
    sellInPassMarket(proposalId: string, amount: number, userPublicKey: string): Promise<Response>;
    buyInFailMarket(proposalId: string, amount: number, userPublicKey: string): Promise<Response>;
    sellInFailMarket(proposalId: string, amount: number, userPublicKey: string): Promise<Response>;
}
