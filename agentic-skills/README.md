# 🧠 Nexus-Sentry Agentic Skills

This directory contains the **JSON Schema definitions** for every "Skill" (Tool) available to the Nexus-Sentry AI Co-Pilot. 

### Why this matters
Nexus-Sentry does not rely on simple prompts or "hallucinated" data. Instead, it uses **Function Calling (Tool Use)** to interact with the X Layer blockchain and OKX Onchain OS in real-time. 

These schemas represent the "bridge" between the Large Language Model (Gemini 3) and our secure Backend API. They prove that the AI is performing **structured logic**, validation, and deterministic data fetching.

### Skill Categories

1.  **[Wallet Intelligence](./wallet-intelligence)**: Tools for auditing net worth, analyzing detailed token PnL, and identifying DeFi/NFT holdings.
2.  **[Market Ops](./market-ops)**: Real-time price discovery, token charting (OHLCV), and DEX Aggregator quoting logic.
3.  **[DeFi Discovery](./defi-discovery)**: High-speed searching of the X Layer ecosystem for yield, staking, and LP opportunities.
4.  **[System Sync](./system-sync)**: Metadata synchronization for keeping the "Source of Truth" (GCS CDN) updated.

---

### How to read a Skill definition
Each `.json` file follows the standard LLM Tool format:
- **`name`**: The internal function name.
- **`description`**: The natural language context provided to the AI so it knows *when* to use this tool.
- **`parameters`**: The rigorous data types (string, integer) and required inputs the AI must provide to generate a valid request.

**Nexus-Sentry: High-Fidelity Intelligence for X Layer.**
