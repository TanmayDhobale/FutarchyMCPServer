import express from "express";
import { AutocratClient, PriceMath } from "@metadaoproject/futarchy/v0.4";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { getAccount, getAssociatedTokenAddressSync, getMint, getOrCreateAssociatedTokenAccount, } from "@solana/spl-token";
import { AmmClient } from "@metadaoproject/futarchy/v0.4";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import fs from "fs";
import { ConditionalVaultClient } from "@metadaoproject/futarchy/v0.4";
const app = express();
const port = process.env.PORT || 9000;
// Load the wallet
const walletSecretKey = new Uint8Array(JSON.parse(fs.readFileSync("wallet.json", "utf-8")));
const wallet = Keypair.fromSecretKey(walletSecretKey);
// Initialize Futarchy clients
const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=ea9c561f-0680-4ae5-835c-5c0e463fa5e4");
const provider = new anchor.AnchorProvider(connection, {
    publicKey: wallet.publicKey,
    signTransaction: async (tx) => {
        if (tx instanceof Transaction) {
            tx.partialSign(wallet);
        }
        else {
            tx.sign([wallet]);
        }
        return tx;
    },
    signAllTransactions: async (txs) => {
        return txs.map((tx) => {
            if (tx instanceof Transaction) {
                tx.partialSign(wallet);
            }
            else {
                tx.sign([wallet]);
            }
            return tx;
        });
    },
}, { commitment: "confirmed" });
const autocratProgram = AutocratClient.createClient({ provider });
// Middleware
app.use(express.json());
// Routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Express TypeScript Server!" });
});
// Get all DAOs
app.get("/daos", async (req, res) => {
    try {
        const daos = await autocratProgram.autocrat.account.dao.all();
        res.json({ success: true, daos });
    }
    catch (error) {
        console.error("Error fetching DAOs:", error);
        res.status(500).json({ error: "Failed to fetch DAOs" });
    }
});
// Get DAO by ID
app.get("/daos/:id", async (req, res) => {
    try {
        const daoAddress = new PublicKey(req.params.id);
        const dao = await autocratProgram.getDao(daoAddress);
        res.json({ dao });
    }
    catch (error) {
        console.error("Error fetching DAO:", error);
        res.status(500).json({ error: "Failed to fetch DAO" });
    }
});
// Get all proposals for a DAO
app.get("/daos/:id/proposals", async (req, res) => {
    try {
        const daoAddress = new PublicKey(req.params.id);
        const proposals = await autocratProgram.autocrat.account.proposal.all();
        const filteredProposals = proposals.filter((prop) => prop.account.dao.toString() === daoAddress.toString());
        res.json({ success: true, proposals: filteredProposals });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch proposals" });
    }
});
// Get proposal by ID
app.get("/proposals/:id", async (req, res) => {
    try {
        const proposalAddress = new PublicKey(req.params.id);
        const proposal = await autocratProgram.getProposal(proposalAddress);
        res.json({ success: true, proposal });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch proposal" });
    }
});
// Create a new proposal
app.post("/daos/:id/proposals", (async (req, res) => {
    try {
        const { descriptionUrl, baseTokensToLP, quoteTokensToLP } = req.body;
        if (!descriptionUrl || !baseTokensToLP || !quoteTokensToLP) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const daoAddress = new PublicKey(req.params.id);
        const dao = await autocratProgram.getDao(daoAddress);
        const tokenMint = await getMint(connection, dao.tokenMint);
        const usdcMint = await getMint(connection, dao.usdcMint);
        const tokenDecimals = tokenMint.decimals;
        const usdcDecimals = usdcMint.decimals;
        // Get or create token accounts for the payer
        const metaAccount = await getOrCreateAssociatedTokenAccount(connection, provider.wallet, // Type assertion for wallet
        dao.tokenMint, provider.wallet.publicKey);
        const usdcAccount = await getOrCreateAssociatedTokenAccount(connection, provider.wallet, // Type assertion for wallet
        dao.usdcMint, provider.wallet.publicKey);
        // Check balances
        const metaBalance = metaAccount.amount;
        const usdcBalance = usdcAccount.amount;
        // Convert input amounts to chain amounts
        const requiredMeta = PriceMath.getChainAmount(baseTokensToLP, tokenDecimals);
        const requiredUsdc = PriceMath.getChainAmount(quoteTokensToLP, usdcDecimals);
        if (metaBalance < BigInt(requiredMeta.toString()) ||
            usdcBalance < BigInt(requiredUsdc.toString())) {
            return res.status(400).json({
                error: "Insufficient balance for proposal creation",
                requiredMeta: requiredMeta.toString(),
                requiredUsdc: requiredUsdc.toString(),
            });
        }
        // Create the proposal instruction
        const accounts = [
            {
                pubkey: daoAddress,
                isSigner: true,
                isWritable: true,
            },
        ];
        const data = autocratProgram.autocrat.coder.instruction.encode("update_dao", {
            daoParams: {
                passThresholdBps: 500,
                baseBurnLamports: null,
                burnDecayPerSlotLamports: null,
                slotsPerProposal: null,
                marketTakerFee: null,
            },
        });
        const ix = {
            programId: autocratProgram.getProgramId(),
            accounts,
            data,
        };
        // Initialize the proposal
        const proposalAddress = await autocratProgram.initializeProposal(daoAddress, descriptionUrl, ix, requiredMeta, requiredUsdc);
        res.json({
            success: true,
            proposalAddress: proposalAddress.toString(),
            message: "Proposal created successfully",
        });
    }
    catch (error) {
        console.error("Error creating proposal:", error);
        res.status(500).json({ error: "Failed to create proposal" });
    }
}));
// Buy in pass market
app.post("/proposals/:id/buy-pass", (async (req, res) => {
    try {
        // Get the amount and user public key from the request body
        const { amount, user } = req.body;
        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }
        if (!user) {
            return res.status(400).json({ error: "User public key is required" });
        }
        const userPublicKey = new PublicKey(user);
        // Get the proposal for which trade has to be made
        const proposalAddress = new PublicKey(req.params.id);
        const proposal = await autocratProgram.getProposal(proposalAddress);
        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }
        // Initialize vault client for token splitting
        const vaultClient = ConditionalVaultClient.createClient({ provider });
        const quoteTokenVault = await vaultClient.fetchVault(proposal.quoteVault);
        if (!quoteTokenVault) {
            return res.status(404).json({ error: "Quote vault not found" });
        }
        // Fetch user's quote token (usually USDC) account so that we can check the balance
        const quoteTokenAddress = getAssociatedTokenAddressSync(quoteTokenVault.underlyingTokenMint, userPublicKey);
        const quoteTokenAccount = await getAccount(connection, quoteTokenAddress);
        // Initialize AMM client to get the pass market AMM
        const ammClient = AmmClient.createClient({ provider });
        const passAmm = await ammClient.getAmm(proposal.passAmm);
        // Get the user's pass market conditional quote token account, so that we can check the balance
        const passQuoteTokenAddress = getAssociatedTokenAddressSync(passAmm.quoteMint, userPublicKey);
        const passQuoteTokenAccount = await getAccount(connection, passQuoteTokenAddress);
        // Get the mint of the quote token and then decimals
        const quoteMint = await getMint(connection, quoteTokenVault.underlyingTokenMint);
        const quoteDecimals = quoteMint.decimals;
        // Get the mint of the pass market conditional quote token (usually pUSDC) and then decimals
        const passQuoteMint = await getMint(connection, passAmm.quoteMint);
        const passQuoteDecimals = passQuoteMint.decimals;
        // Convert balances to human-readable format
        const usdcBalance = Number(quoteTokenAccount.amount) / Math.pow(10, quoteDecimals);
        const passQuoteBalance = Number(passQuoteTokenAccount.amount) / Math.pow(10, passQuoteDecimals);
        // Calculate the maximum amount that can be bought
        const maxBuyAmount = usdcBalance + passQuoteBalance;
        // Check if requested amount is within limits
        if (amount > maxBuyAmount) {
            return res.status(400).json({
                error: "Insufficient balance",
                requested: amount,
                available: maxBuyAmount,
                usdcBalance,
                passQuoteBalance,
            });
        }
        let splitTx = null;
        // If entered amount is greater than user's conditional pass quote balance,
        // we need to split quote tokens into pass quote and fail quote first
        if (amount > passQuoteBalance) {
            const amountToSplit = amount - passQuoteBalance;
            const amountToSplitChain = new BN(Math.floor(amountToSplit * Math.pow(10, quoteDecimals)));
            // Split tokens before swap
            const splitIx = vaultClient.splitTokensIx(proposal.question, proposal.quoteVault, quoteTokenVault.underlyingTokenMint, amountToSplitChain, 2, // numOutcomes (PASS/FAIL)
            provider.wallet.publicKey);
            // Build the split transaction
            splitTx = new Transaction().add(await splitIx.instruction());
        }
        // Calculate expected output amount and minimum output amount with assumed 1% slippage
        const expectedOutput = new BN(passAmm.baseAmount)
            .mul(new BN(amount))
            .div(new BN(passAmm.quoteAmount).add(new BN(amount)));
        const slippageTolerance = 0.01; // 1% slippage tolerance
        const slippageFactorBN = new BN(Math.floor((1 - slippageTolerance) * 100));
        const outputAmountMin = expectedOutput
            .mul(slippageFactorBN)
            .div(new BN(100));
        // Get the swap instruction
        const swapIx = ammClient.swapIx(proposal.passAmm, passAmm.baseMint, passAmm.quoteMint, { buy: {} }, new BN(amount), outputAmountMin, userPublicKey);
        const swapTx = new Transaction().add(await swapIx.instruction());
        res.json({
            success: true,
            withSplit: splitTx ? true : false,
            splitTx,
            swapTx,
            expectedOutput: expectedOutput.toString(),
            minOutput: outputAmountMin.toString(),
            message: "Buy in pass market transactions created successfully",
        });
    }
    catch (error) {
        console.error("Error executing buy in pass market:", error);
        res.status(500).json({ error: "Failed to execute buy in pass market" });
    }
}));
// Sell in pass market
app.post("/proposals/:id/sell-pass", (async (req, res) => {
    try {
        const { amount, user } = req.body;
        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }
        if (!user) {
            return res.status(400).json({ error: "User public key is required" });
        }
        const userPublicKey = new PublicKey(user);
        // Get the proposal
        const proposalAddress = new PublicKey(req.params.id);
        const proposal = await autocratProgram.getProposal(proposalAddress);
        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }
        // Initialize AMM client to get the pass market AMM
        const ammClient = AmmClient.createClient({ provider });
        const passAmm = await ammClient.getAmm(proposal.passAmm);
        // Get the user's balance of the pass market AMM's underlying token (the base token)
        const passMarketBaseTokenAddress = getAssociatedTokenAddressSync(passAmm.baseMint, userPublicKey);
        const passMarketBaseTokenAccount = await getAccount(connection, passMarketBaseTokenAddress);
        // Get the token decimals
        const passMarketBaseTokenMint = await getMint(connection, passAmm.baseMint);
        const passMarketBaseTokenDecimals = passMarketBaseTokenMint.decimals;
        // Convert user's balance to human-readable format
        const userBaseBalance = Number(passMarketBaseTokenAccount.amount) /
            Math.pow(10, passMarketBaseTokenDecimals);
        // Check if user has sufficient balance
        if (amount > userBaseBalance) {
            return res.status(400).json({
                error: "Insufficient balance",
                requested: amount,
                available: userBaseBalance,
            });
        }
        // Calculate expected output and minimum output with 1% slippage
        const expectedOutput = new BN(passAmm.quoteAmount)
            .mul(new BN(amount))
            .div(new BN(passAmm.baseAmount).add(new BN(amount)));
        const slippageTolerance = 0.01; // 1% slippage tolerance
        const slippageFactorBN = new BN(Math.floor((1 - slippageTolerance) * 100));
        const outputAmountMin = expectedOutput
            .mul(slippageFactorBN)
            .div(new BN(100));
        // Execute the swap - no need to adjust for decimals here as swap function handles it
        const swapIx = ammClient.swapIx(proposal.passAmm, passAmm.baseMint, passAmm.quoteMint, { sell: {} }, new BN(amount), outputAmountMin, userPublicKey);
        const swapTx = new Transaction().add(await swapIx.instruction());
        res.json({
            success: true,
            swapTx,
            expectedOutput: Number(expectedOutput),
            minOutput: Number(outputAmountMin),
            message: "Sell in pass market transaction created successfully",
        });
    }
    catch (error) {
        console.error("Error executing sell in pass market:", error);
        res.status(500).json({ error: "Failed to execute sell in pass market" });
    }
}));
// Buy in fail market
app.post("/proposals/:id/buy-fail", (async (req, res) => {
    try {
        const { amount, user } = req.body;
        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }
        if (!user) {
            return res.status(400).json({ error: "User public key is required" });
        }
        const userPublicKey = new PublicKey(user);
        // Get the proposal
        const proposalAddress = new PublicKey(req.params.id);
        const proposal = await autocratProgram.getProposal(proposalAddress);
        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }
        const vaultClient = ConditionalVaultClient.createClient({ provider });
        const quoteVault = await vaultClient.fetchVault(proposal.quoteVault);
        if (!quoteVault) {
            return res.status(404).json({ error: "Quote vault not found" });
        }
        // Check user's quote token account
        const quoteTokenAddress = getAssociatedTokenAddressSync(quoteVault.underlyingTokenMint, userPublicKey);
        const quoteTokenAccount = await getAccount(connection, quoteTokenAddress);
        // Initialize AMM client to get the fail market AMM
        const ammClient = AmmClient.createClient({ provider });
        const amm = await ammClient.getAmm(proposal.failAmm);
        // Get the user's fail market quote token balance
        const failQuoteTokenAddress = getAssociatedTokenAddressSync(amm.quoteMint, userPublicKey);
        const failQuoteTokenAccount = await getAccount(connection, failQuoteTokenAddress);
        // Get the decimals for the quote token (usually USDC) from the quote vault
        const quoteMint = await getMint(connection, quoteVault.underlyingTokenMint);
        const quoteDecimals = quoteMint.decimals;
        // Get the mint of the fail market conditional quote token (usually fUSDC) and then decimals
        const failQuoteMint = await getMint(connection, amm.quoteMint);
        const failMarketQuoteDecimals = failQuoteMint.decimals;
        // Convert balances to human-readable format
        const quoteTokenBalance = Number(quoteTokenAccount.amount) / Math.pow(10, quoteDecimals);
        const failQuoteTokenBalance = Number(failQuoteTokenAccount.amount) /
            Math.pow(10, failMarketQuoteDecimals);
        // Calculate the maximum amount that can be bought
        const maxBuyAmount = quoteTokenBalance + failQuoteTokenBalance;
        // Check if requested amount is within limits
        if (amount > maxBuyAmount) {
            return res.status(400).json({
                error: "Insufficient balance",
                requested: amount,
                available: maxBuyAmount,
                quoteTokenBalance,
                failQuoteTokenBalance,
            });
        }
        let splitTx = null;
        // If amount is greater than user's fail quote token balance, we need to split USDC first
        if (amount > failQuoteTokenBalance) {
            const amountToSplit = amount - failQuoteTokenBalance;
            const amountToSplitChain = new BN(Math.floor(amountToSplit * Math.pow(10, quoteDecimals)).toString());
            // Split tokens before swap
            const splitIx = vaultClient.splitTokensIx(proposal.question, proposal.quoteVault, quoteVault.underlyingTokenMint, amountToSplitChain, 2, // numOutcomes (PASS/FAIL)
            provider.wallet.publicKey);
            // Send the split transaction
            splitTx = new Transaction().add(await splitIx.instruction());
        }
        // Calculate expected output and minimum output with 1% slippage
        const expectedOutput = new BN(amm.baseAmount)
            .mul(new BN(amount))
            .div(new BN(amm.quoteAmount).add(new BN(amount)));
        const slippageTolerance = 0.01; // 1% slippage tolerance
        const slippageFactorBN = new BN(Math.floor((1 - slippageTolerance) * 100));
        const outputAmountMin = expectedOutput
            .mul(slippageFactorBN)
            .div(new BN(100));
        // Execute the swap
        const swapIx = ammClient.swapIx(proposal.failAmm, amm.quoteMint, amm.baseMint, { buy: {} }, new BN(amount), outputAmountMin, userPublicKey);
        const swapTx = new Transaction().add(await swapIx.instruction());
        res.json({
            success: true,
            withSplit: splitTx ? true : false,
            splitTx,
            swapTx,
            expectedOutput: Number(expectedOutput),
            minOutput: Number(outputAmountMin),
            message: "Buy in fail market transaction created successfully",
        });
    }
    catch (error) {
        console.error("Error executing buy in fail market:", error);
        res.status(500).json({ error: "Failed to execute buy in fail market" });
    }
}));
// Sell in fail market
app.post("/proposals/:id/sell-fail", (async (req, res) => {
    try {
        const { amount, user } = req.body;
        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }
        if (!user) {
            return res.status(400).json({ error: "User public key is required" });
        }
        const userPublicKey = new PublicKey(user);
        // Get the proposal
        const proposalAddress = new PublicKey(req.params.id);
        const proposal = await autocratProgram.getProposal(proposalAddress);
        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }
        // Initialize AMM client to get the fail market AMM
        const ammClient = AmmClient.createClient({ provider });
        const amm = await ammClient.getAmm(proposal.failAmm);
        // Get the user's balance of the fail market AMM's underlying token (the base token)
        const failMarketBaseTokenAddress = getAssociatedTokenAddressSync(amm.baseMint, userPublicKey);
        const failMarketBaseTokenAccount = await getAccount(connection, failMarketBaseTokenAddress);
        // Get the token decimals
        const failMarketBaseTokenMint = await getMint(connection, amm.baseMint);
        const failMarketBaseTokenDecimals = failMarketBaseTokenMint.decimals;
        // Convert user's balance to human-readable format
        const userBaseBalance = Number(failMarketBaseTokenAccount.amount) /
            Math.pow(10, failMarketBaseTokenDecimals);
        // Check if user has sufficient balance
        if (amount > userBaseBalance) {
            return res.status(400).json({
                error: "Insufficient balance",
                requested: amount,
                available: userBaseBalance,
            });
        }
        // Calculate expected output and minimum output with 1% slippage
        const expectedOutput = new BN(amm.quoteAmount)
            .mul(new BN(amount))
            .div(new BN(amm.baseAmount).add(new BN(amount)));
        const slippageTolerance = 0.01; // 1% slippage tolerance
        const slippageFactorBN = new BN(Math.floor((1 - slippageTolerance) * 100));
        const outputAmountMin = expectedOutput
            .mul(slippageFactorBN)
            .div(new BN(100));
        // Execute the swap - no need to adjust for decimals here as swap function handles it
        const swapIx = ammClient.swapIx(proposal.failAmm, amm.quoteMint, amm.baseMint, { sell: {} }, new BN(amount), outputAmountMin, userPublicKey);
        const swapTx = new Transaction().add(await swapIx.instruction());
        res.json({
            success: true,
            swapTx,
            expectedOutput: Number(expectedOutput),
            minOutput: Number(outputAmountMin),
            message: "Sell in fail market transaction created successfully",
        });
    }
    catch (error) {
        console.error("Error executing sell in fail market:", error);
        res.status(500).json({ error: "Failed to execute sell in fail market" });
    }
}));
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
