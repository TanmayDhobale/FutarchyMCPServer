import { Response, CreateProposalParams } from './types.js';
export declare class FutarchyApiClient {
    private baseUrl;
    constructor(baseUrl?: string);
    getDaos(): Promise<Response>;
    getDao(daoId: string): Promise<Response>;
    getProposals(daoId: string): Promise<Response>;
    getProposal(proposalId: string): Promise<Response>;
    createProposal(params: CreateProposalParams): Promise<Response>;
}
