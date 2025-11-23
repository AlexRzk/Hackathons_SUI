#!/usr/bin/env node
/**
 * Nimbus SDK Bridge - HTTP Server
 * Expose Nimbus SDK functions via HTTP pour l'agent Python
 */

import { SuiAgentKit } from "@getnimbus/sui-agent-kit";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Configuration
const PRIVATE_KEY = process.env.SUI_PRIVATE_KEY || "";
const RPC_URL = process.env.SUI_RPC_URL || "https://fullnode.testnet.sui.io";
const PORT = process.env.BRIDGE_PORT || 3001;

// Initialiser Nimbus Agent Kit
let agent: SuiAgentKit | null = null;

if (PRIVATE_KEY) {
  try {
    agent = new SuiAgentKit(PRIVATE_KEY, RPC_URL, {});
    console.log("[NIMBUS] ✅ Agent Kit initialized");
    console.log(`[NIMBUS] 📍 RPC: ${RPC_URL}`);
    console.log(`[NIMBUS] 💼 Wallet: ${agent.getWalletAddress()}`);
  } catch (error) {
    console.error("[NIMBUS] ❌ Failed to initialize:", error);
  }
} else {
  console.warn("[NIMBUS] ⚠️  No private key - running in simulation mode");
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    agent_ready: agent !== null,
    rpc_url: RPC_URL,
    timestamp: Date.now(),
  });
});

// Get wallet info
app.get("/wallet", async (req, res) => {
  if (!agent) {
    return res.status(503).json({ error: "Agent not initialized" });
  }

  try {
    const address = agent.getWalletAddress();
    const holdings = await agent.getHoldings();

    res.json({
      address,
      holdings,
      rpc_url: RPC_URL,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Execute action
app.post("/execute", async (req, res) => {
  if (!agent) {
    return res.status(503).json({ error: "Agent not initialized" });
  }

  const { action, params } = req.body;

  if (!action) {
    return res.status(400).json({ error: "Missing 'action' parameter" });
  }

  console.log(`[NIMBUS] 🚀 Executing: ${action}`, params);

  try {
    let result;

    switch (action) {
      case "BUY_SUI":
      case "SWAP_TO_SUI":
        // Swap vers SUI (ex: USDC -> SUI)
        result = await agent.swap({
          fromToken: params.coinIn || "USDC",
          toToken: "SUI",
          inputAmount: params.amount || 10,
          slippage: params.slippage || 0.01,
          aggregator: params.aggregator || "cetus", // cetus, turbos, etc.
        });
        break;

      case "SELL_SUI":
      case "SWAP_FROM_SUI":
        // Swap depuis SUI (ex: SUI -> USDC)
        result = await agent.swap({
          fromToken: "SUI",
          toToken: params.coinOut || "USDC",
          inputAmount: params.amount || 10,
          slippage: params.slippage || 0.01,
          aggregator: params.aggregator || "cetus",
        });
        break;

      case "STAKE_SUI":
        // Staking SUI
        result = await agent.stake(
          params.amount || 1,
          params.poolId || "", // Validator pool ID
        );
        break;

      case "UNSTAKE_SUI":
        // Unstaking SUI
        result = await agent.unstake(params.stakedSuiId);
        break;

      case "GET_BALANCE":
      case "GET_HOLDINGS":
        // Récupérer holdings
        result = await agent.getHoldings();
        break;

      case "GET_PORTFOLIO":
      case "GET_STAKE":
        // Récupérer stakes
        result = await agent.getStake();
        break;

      case "TRANSFER":
        // Transfert de tokens
        result = await agent.transferToken(
          params.coinType || "SUI",
          params.to,
          params.amount,
        );
        break;

      default:
        return res.status(400).json({
          error: `Unknown action: ${action}`,
          available: [
            "BUY_SUI",
            "SELL_SUI",
            "STAKE_SUI",
            "UNSTAKE_SUI",
            "GET_HOLDINGS",
            "GET_STAKE",
            "TRANSFER",
          ],
        });
    }

    console.log(`[NIMBUS] ✅ Success:`, result);

    res.json({
      status: "success",
      action,
      result,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error(`[NIMBUS] ❌ Error:`, error);
    res.status(500).json({
      status: "error",
      action,
      error: error.message,
      timestamp: Date.now(),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[NIMBUS BRIDGE] 🌉 Server running on port ${PORT}`);
  console.log(`[NIMBUS BRIDGE] 🔗 http://localhost:${PORT}`);
  console.log(`${"=".repeat(60)}\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[NIMBUS] 🛑 Shutting down...");
  process.exit(0);
});
