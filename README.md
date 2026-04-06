# X Layer Portfolio Tracker Backend 📈

This is a robust, serverless-ready FastAPI backend for tracking wallet assets and transaction history on the **X Layer (Mainnet 196)** using the OKX Onchain OS API.

## Features 🚀
*   **Total USD Valuation**: Real-time USD aggregation of wallet assets.
*   **Token Balances**: Detailed lists of ERC-20 tokens held on X Layer.
*   **PnL Analytics**: Performance overview (Realized PnL, Win Rate).
*   **NFT Inventory**: Global portfolio view of owned NFTs.
*   **DeFi Yield**: Staked assets and yield position summaries.
*   **DEX Swaps**: Real-time swap quotes from OKX Aggregator.
*   **Market Stats**: Global market data and Fear & Greed Index from CoinMarketCap.

## Deployment 🌐
Optimized for **Google Cloud Run** using `Dockerfile` and **Secret Manager** for secure API key management.

## Tech Stack 🛠️
*   **FastAPI** (Python 3.11+)
*   **OKX Onchain OS API** (v6)
*   **CoinMarketCap API**
*   **Docker**
*   **Google Cloud SDK**
