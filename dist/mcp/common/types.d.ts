import { z } from 'zod';
export declare const ResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    data?: any;
    error?: string | undefined;
}, {
    success: boolean;
    data?: any;
    error?: string | undefined;
}>;
export type Response = z.infer<typeof ResponseSchema>;
export declare const DaoSchema: z.ZodObject<{
    address: z.ZodString;
    tokenMint: z.ZodString;
    usdcMint: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tokenMint: string;
    usdcMint: string;
    address: string;
}, {
    tokenMint: string;
    usdcMint: string;
    address: string;
}>;
export type Dao = z.infer<typeof DaoSchema>;
export declare const ProposalSchema: z.ZodObject<{
    address: z.ZodString;
    dao: z.ZodString;
    descriptionUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    dao: string;
    descriptionUrl: string;
    address: string;
}, {
    dao: string;
    descriptionUrl: string;
    address: string;
}>;
export type Proposal = z.infer<typeof ProposalSchema>;
export declare const GetDaosParamsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const GetDaoParamsSchema: z.ZodObject<{
    daoId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    daoId: string;
}, {
    daoId: string;
}>;
export declare const GetProposalsParamsSchema: z.ZodObject<{
    daoId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    daoId: string;
}, {
    daoId: string;
}>;
export declare const GetProposalParamsSchema: z.ZodObject<{
    proposalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    proposalId: string;
}, {
    proposalId: string;
}>;
export declare const CreateProposalParamsSchema: z.ZodObject<{
    daoId: z.ZodString;
    descriptionUrl: z.ZodString;
    baseTokensToLP: z.ZodNumber;
    quoteTokensToLP: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    descriptionUrl: string;
    baseTokensToLP: number;
    quoteTokensToLP: number;
    daoId: string;
}, {
    descriptionUrl: string;
    baseTokensToLP: number;
    quoteTokensToLP: number;
    daoId: string;
}>;
export type GetDaosParams = z.infer<typeof GetDaosParamsSchema>;
export type GetDaoParams = z.infer<typeof GetDaoParamsSchema>;
export type GetProposalsParams = z.infer<typeof GetProposalsParamsSchema>;
export type GetProposalParams = z.infer<typeof GetProposalParamsSchema>;
export type CreateProposalParams = z.infer<typeof CreateProposalParamsSchema>;
