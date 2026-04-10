# Nexus-Sentry V2: The Premier X Layer Intelligence Dashboard 🚀

Nexus-Sentry V2 is an institutional-grade onchain management platform designed specifically for the **X Layer (Mainnet 196)**. It combines real-time portfolio tracking, DeFi discovery, and a powerful AI Co-Pilot to provide a seamless decentralized finance experience.

![Nexus-Sentry Architecture](https://img.shields.io/badge/Architecture-Hybrid_Serverless-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_|_FastAPI_|_Gemini-green)
![Chain](https://img.shields.io/badge/Network-X_Layer-00ffcc)

---

## 🏗️ System Architecture

Nexus-Sentry is built with a high-performance hybrid architecture ensuring low latency and maximum reliability.

### 1. Frontend (The Command Center)
- **Framework**: Next.js 16 (App Router) with TypeScript.
- **State Management**: Zustand for global wallet and chat states.
- **Styling**: Tailwind CSS v4 + Framer Motion for premium "Obsidian Neon" aesthetics.
- **Charts**: Recharts with hydration-safety for real-time performance telemetry.

### 2. Backend (The Engine Room)
- **API**: FastAPI (Python 3.11) optimized for high-concurrency.
- **AI Agent**: **Google Gemini 3 Flash** integrated with **Function Calling** (Tool Use). The agent can autonomously query onchain data, analyze market metrics, and research yield.
- **Services**:
  - `OKX Onchain OS`: Primary data source for balances, swaps, and DeFi.
  - `CoinMarketCap`: Global market intelligence (Fear & Greed, BTC Dominance).
  - `MetadataSync`: Background engine that cleans and caches large datasets.

### 3. Data & Infrastructure
- **CDN**: Google Cloud Storage (GCS) acts as a high-speed CDN for token and liquidity metadata.
- **Compute**: Google Cloud Run (Serverless) for the Python backend.
- **Hosting**: Vercel for the frontend edge delivery.

---

## 🛠️ Key Functionalities

### 1. **Nexus Intelligence (AI Co-Pilot)**
An autonomous side-panel assistant capable of:
- Analyzing your wallet's PnL and risk exposure.
- Finding the best yield opportunities based on natural language queries ("Where can I earn the highest stETH yield?").
- Providing real-time market analysis and sentiment data.

### 2. **Institutional Portfolio**
- **Unified Visibility**: Aggregated USD valuation across all X Layer assets.
- **PnL Analytics**: Performance tracking including win rates and historical PnL trends.
- **Asset Inventory**: Detailed token list with real-time price feeds and usage telemetry.
- **Transaction History**: Decoded onchain activity log.

### 3. **Smart Discovery (DeFi)**
- **Yield Search**: Explore staking, LP, and lending protocols.
- **Telemetry Charts**: Historical APY and TVL data visualization to identify trends before investing.

### 4. **Adaptive Swap**
- **Liquidity Aggregation**: Integrated with OKX Aggregator for best-in-class pricing.
- **Route Visualization**: Real-time quotes with slippage adjustment and route mapping.

---

## 🎯 Use Cases

- **Asset Management**: Traders managing large portfolios on X Layer who need professional-grade analytics.
- **Yield Farming**: DeFi users looking for high-accuracy product discovery and APY tracking.
- **AI-Guided Trading**: Users who want an intelligent co-pilot to research tokens and quotes before executing.

---

## 🚀 Deployment Guide

### Backend (Cloud Run)
1. **Infrastructure**:
   - Enable **Cloud Run**, **Secret Manager**, and **Cloud Storage**.
   - Create a GCS bucket named `x-layer-metadata-[PROJECT_ID]`. 
2. **Secrets**:
   - Store `OKX_API_KEY`, `GEMINI_API_KEY`, and `X_CMC_PRO_API_KEY` in Secret Manager.
3. **Deploy**:
   ```bash
   gcloud run deploy x-layer-api --source ./backend --env-vars-file .env.yaml
   ```

### Frontend (Vercel)
1. **Root Directory**: Set to `frontend`.
2. **Presets**: Next.js (Automatic detection).
3. **Environment**: Ensure no client-side secrets are needed as configuration is handled in `src/lib/constants.ts`.
4. **Build**:
   ```bash
   npm run build
   ```

---

## 📜 Development Notes
- **CORS**: The backend is configured to allow all origins (`*`) for cross-domain flexibility with Vercel and local environments.
- **Hydration**: Components like charts are wrapped in `mounted` state guards to ensure SSR compatibility.
- **Token Pruning**: The MetadataSync service prunes OKX data to reduce transfer sizes by >80%.

---
Made with ⚡ by Nexus-Sentry Team.
