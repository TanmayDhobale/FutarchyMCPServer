import { Response, Dao, Proposal, CreateProposalParams, SentimentAnalysis } from './types.js';
import { getProposalSentimentAnalysis } from './sentiment-service.js';
import { PublicKey, Transaction } from '@solana/web3.js';
import { AmmClient, ConditionalVaultClient } from '@metadaoproject/futarchy/v0.4';
import { getAccount, getAssociatedTokenAddressSync, getMint } from '@solana/spl-token';
import pkg from '@coral-xyz/anchor';
const { BN } = pkg;

export class FutarchyApiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:9000') {
    this.baseUrl = baseUrl;
  }

  async getDaos(): Promise<Response> {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch DAOs'
      };
    }
  }

  async getDao(daoId: string): Promise<Response> {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to fetch DAO with ID: ${daoId}`
      };
    }
  }

  async getProposals(daoId: string): Promise<Response> {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to fetch proposals for DAO: ${daoId}`
      };
    }
  }

  async getProposal(proposalId: string): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}/proposals/${proposalId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Get sentiment analysis for this proposal
      try {
        const sentimentAnalysis = await getProposalSentimentAnalysis(proposalId);
        
        // Combine proposal data with sentiment analysis
        return {
          success: true,
          data: {
            ...data.proposal,
            sentimentAnalysis
          }
        };
      } catch (sentimentError) {
        console.error(`Error getting sentiment analysis: ${sentimentError}`);
        // Return proposal data without sentiment analysis if it fails
        return {
          success: true,
          data: data.proposal
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to fetch proposal with ID: ${proposalId}`
      };
    }
  }

  async createProposal(params: CreateProposalParams): Promise<Response> {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create proposal'
      };
    }
  }
  
  async getProposalSentimentAnalysis(proposalId: string): Promise<Response> {
    try {
      // In a production setting, this would call an API endpoint
      // For now, we'll directly use our sentiment analysis service
      const sentimentAnalysis = await getProposalSentimentAnalysis(proposalId);
      
      return {
        success: true,
        data: sentimentAnalysis
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to get sentiment analysis for proposal: ${proposalId}`
      };
    }
  }

  // New trading functions
  async buyInPassMarket(proposalId: string, amount: number, userPublicKey: string): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}/proposals/${proposalId}/buy-pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          user: userPublicKey
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to buy in pass market'
      };
    }
  }

  async sellInPassMarket(proposalId: string, amount: number, userPublicKey: string): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}/proposals/${proposalId}/sell-pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          user: userPublicKey
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to sell in pass market'
      };
    }
  }

  async buyInFailMarket(proposalId: string, amount: number, userPublicKey: string): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}/proposals/${proposalId}/buy-fail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          user: userPublicKey
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to buy in fail market'
      };
    }
  }

  async sellInFailMarket(proposalId: string, amount: number, userPublicKey: string): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}/proposals/${proposalId}/sell-fail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          user: userPublicKey
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to sell in fail market'
      };
    }
  }
} 