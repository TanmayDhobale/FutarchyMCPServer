export class FutarchyApiClient {
    constructor(baseUrl = 'http://localhost:9000') {
        this.baseUrl = baseUrl;
    }
    async getDaos() {
        try {
            const response = await fetch(`${this.baseUrl}/daos`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return {
                success: true,
                data: data.daos
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch DAOs'
            };
        }
    }
    async getDao(daoId) {
        try {
            const response = await fetch(`${this.baseUrl}/daos/${daoId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return {
                success: true,
                data: data.dao
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || `Failed to fetch DAO with ID: ${daoId}`
            };
        }
    }
    async getProposals(daoId) {
        try {
            const response = await fetch(`${this.baseUrl}/daos/${daoId}/proposals`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return {
                success: true,
                data: data.proposals
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || `Failed to fetch proposals for DAO: ${daoId}`
            };
        }
    }
    async getProposal(proposalId) {
        try {
            const response = await fetch(`${this.baseUrl}/proposals/${proposalId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return {
                success: true,
                data: data.proposal
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || `Failed to fetch proposal with ID: ${proposalId}`
            };
        }
    }
    async createProposal(params) {
        try {
            const { daoId, descriptionUrl, baseTokensToLP, quoteTokensToLP } = params;
            const response = await fetch(`${this.baseUrl}/daos/${daoId}/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    descriptionUrl,
                    baseTokensToLP,
                    quoteTokensToLP
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return {
                success: true,
                data: data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to create proposal'
            };
        }
    }
}
