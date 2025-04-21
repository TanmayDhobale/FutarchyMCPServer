import { FutarchyApiClient } from '../common/api.js';
import { GetDaosParamsSchema, GetDaoParamsSchema, GetProposalsParamsSchema, GetProposalParamsSchema, CreateProposalParamsSchema, } from '../common/types.js';
const apiClient = new FutarchyApiClient();
export const getDaos = {
    name: 'getDaos',
    description: 'Get all DAOs from the Futarchy system',
    inputSchema: GetDaosParamsSchema,
    execute: async (_params) => {
        const response = await apiClient.getDaos();
        if (!response.success) {
            return {
                error: response.error || 'Unknown error',
            };
        }
        return {
            result: {
                daos: response.data,
            },
        };
    },
};
export const getDao = {
    name: 'getDao',
    description: 'Get a specific DAO by ID',
    inputSchema: GetDaoParamsSchema,
    execute: async (params) => {
        const { daoId } = params;
        const response = await apiClient.getDao(daoId);
        if (!response.success) {
            return {
                error: response.error || 'Unknown error',
            };
        }
        return {
            result: {
                dao: response.data,
            },
        };
    },
};
export const getProposals = {
    name: 'getProposals',
    description: 'Get all proposals for a specific DAO',
    inputSchema: GetProposalsParamsSchema,
    execute: async (params) => {
        const { daoId } = params;
        const response = await apiClient.getProposals(daoId);
        if (!response.success) {
            return {
                error: response.error || 'Unknown error',
            };
        }
        return {
            result: {
                proposals: response.data,
            },
        };
    },
};
export const getProposal = {
    name: 'getProposal',
    description: 'Get a specific proposal by ID',
    inputSchema: GetProposalParamsSchema,
    execute: async (params) => {
        const { proposalId } = params;
        const response = await apiClient.getProposal(proposalId);
        if (!response.success) {
            return {
                error: response.error || 'Unknown error',
            };
        }
        return {
            result: {
                proposal: response.data,
            },
        };
    },
};
export const createProposal = {
    name: 'createProposal',
    description: 'Create a new proposal for a DAO',
    inputSchema: CreateProposalParamsSchema,
    execute: async (params) => {
        const response = await apiClient.createProposal(params);
        if (!response.success) {
            return {
                error: response.error || 'Unknown error',
            };
        }
        return {
            result: response.data,
        };
    },
};
export const tools = [
    getDaos,
    getDao,
    getProposals,
    getProposal,
    createProposal,
];
