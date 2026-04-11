from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from okx_utils import OKXClient
from metadata_sync import MetadataSync
import requests
import os
from agent_utils import chat_with_sentry
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="X Layer Portfolio API", version="1.0.0")

# --- PRODUCTION CORS SETUP ---
# In production, you'd want to restrict this to your actual frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, # Required for allow_origins=["*"]
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

okx = OKXClient()

# --- FATAL STARTUP CHECK ---
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_KEY:
    print("❌ FATAL: GEMINI_API_KEY is empty! AI functions will fail.")
else:
    print("✅ GEMINI_API_KEY detected.")

@app.get("/")
def read_root():
    return {"message": "X Layer Portfolio API is running!"}

# --- Category A: Wallet & Asset ---

@app.get("/portfolio/{address}/total")
def get_total_value(address: str):
    """Get the aggregated USD value of a wallet on X Layer (Chain ID 196)."""
    address = address.strip()
    params = {
        "address": address,
        "chains": "196" # X Layer
    }
    # Using the v6 DEX endpoint you identified as it returned data nicely!
    data = okx.request("GET", "/api/v6/dex/balance/total-value-by-address", params=params)
    
    if data.get("code") != "0":
        raise HTTPException(status_code=400, detail=data.get("msg", "Error fetching total value"))
    
    return data

@app.get("/portfolio/{address}/balances")
def get_token_balances(address: str):
    """Lists every token (ERC-20) held on X Layer."""
    address = address.strip()
    params = {
        "address": address,
        "chains": "196" # X Layer
    }
    # Using the v6 All Token Balances endpoint
    data = okx.request("GET", "/api/v6/dex/balance/all-token-balances-by-address", params=params)
    return data

# --- Category B: Transaction History ---

@app.get("/portfolio/{address}/history")
def get_transaction_history(address: str):
    """Fetches a decoded list of all transfers, swaps, and interactions."""
    address = address.strip()
    params = {
        "address": address,
        "chains": "196" # X Layer
    }
    # Updated to the v6 Transaction History endpoint
    data = okx.request("GET", "/api/v6/dex/post-transaction/transactions-by-address", params=params)
    return data

# --- Category C: Market Data (Integrated from coinmarketcap.py) ---

@app.get("/market/fear-greed")
def get_fear_and_greed():
    """Fetches latest crypto fear and greed index."""
    api_key = os.getenv("X_CMC_PRO_API_KEY", os.getenv("X-CMC_PRO_API_KEY", "")).strip()
    url = "https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest"
    headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': api_key,
    }
    response = requests.get(url, headers=headers)
    return response.json()

@app.get("/market/global-stats")
def get_global_metrics():
    """Fetches global market quotes (Total Market Cap, BTC Dominance, etc.)."""
    api_key = os.getenv("X_CMC_PRO_API_KEY", os.getenv("X-CMC_PRO_API_KEY", "")).strip()
    url = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest"
    headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': api_key,
    }
    response = requests.get(url, headers=headers)
    return response.json()

# --- Placeholder for future endpoints (PnL, NFTs) ---

@app.get("/portfolio/{address}/pnl")
def get_pnl(address: str, timeframe: int = 3):
    """
    Retrieve PnL analysis including realized PnL, win rate, and top tokens.
    Timeframe: 1=1D, 2=3D, 3=7D, 4=1M, 5=3M (Default: 7D)
    """
    address = address.strip()
    params = {
        "chainIndex": "196", # X Layer
        "walletAddress": address,
        "timeFrame": str(timeframe)
    }
    data = okx.request("GET", "/api/v6/dex/market/portfolio/overview", params=params)
    return data

@app.get("/portfolio/{address}/pnl/history")
def get_pnl_history(address: str, chain_index: str = "196", limit: int = 10):
    """Retrieve recent PnL list (historical trades and performance)."""
    params = {
        "chainIndex": chain_index,
        "walletAddress": address.strip(),
        "limit": str(limit)
    }
    data = okx.request("GET", "/api/v6/dex/market/portfolio/recent-pnl", params=params)
    return data
# --- Category D: Trade & Swap ---

@app.get("/trade/quote")
def get_swap_quote(
    from_token: str, 
    to_token: str, 
    amount: str, 
    slippage: float = 0.5
):
    """
    Get a real-time swap quote from OKX DEX Aggregator.
    Amount should be in smallest units (e.g., 1e18 for ETH).
    """
    from_token = from_token.strip()
    to_token = to_token.strip()
    amount = amount.strip()
    
    params = {
        "chainIndex": "196", # X Layer
        "fromTokenAddress": from_token,
        "toTokenAddress": to_token,
        "amount": amount,
        "slippage": str(slippage)
    }
    data = okx.request("GET", "/api/v6/dex/aggregator/quote", params=params)
    return data

@app.get("/trade/tokens")
def get_supported_tokens(chain_index: str = "196"):
    """Get all supported tokens for the aggregator on a specific chain."""
    params = {"chainIndex": chain_index}
    data = okx.request("GET", "/api/v6/dex/aggregator/all-tokens", params=params)
    return data

@app.get("/trade/chains")
def get_aggregator_chains():
    """Get all chains supported by the DEX aggregator."""
    data = okx.request("GET", "/api/v6/dex/aggregator/supported/chain")
    return data

@app.get("/trade/liquidity")
def get_liquidity_sources(chain_index: str = "196"):
    """Get all liquidity sources (DEXs) for a specific chain."""
    params = {"chainIndex": chain_index}
    data = okx.request("GET", "/api/v6/dex/aggregator/get-liquidity", params={"chainIndex": chain_index})
    return data

# --- Category G: Metadata & CDN Sync ---

@app.post("/sync/metadata")
def trigger_metadata_sync(chain_id: str = "196"):
    """Manually trigger a sync of OKX metadata to Google Cloud Storage (CDN)."""
    sync_engine = MetadataSync()
    result = sync_engine.sync_all(chain_id=chain_id)
    return {
        "status": "success" if result else "failed",
        "cdn_urls": result
    }

@app.get("/metadata/urls")
def get_metadata_urls(chain_id: str = "196"):
    """Returns the public CDN URLs for the cleaned Source of Truth files."""
    # Using the project number for uniqueness as defined in gcs_utils
    base = f"https://storage.googleapis.com/x-layer-metadata-349808161165"
    return {
        "tokens": f"{base}/tokens_{chain_id}.json",
        "chains": f"{base}/chains.json",
        "liquidity": f"{base}/liquidity_{chain_id}.json"
    }

# --- Category F: Market Intelligence ---

@app.post("/market/price")
def get_token_price(chain_index: str, token_address: str):
    """Retrieve the latest real-time price for a specific token."""
    body = [{
        "chainIndex": chain_index,
        "tokenContractAddress": token_address.lower()
    }]
    data = okx.request("POST", "/api/v6/dex/market/price", body=body)
    return data

@app.get("/market/candles")
def get_historical_candles(
    token_address: str, 
    chain_index: str = "196", 
    bar: str = "1H", 
    limit: int = 100
):
    """Fetch OHLCV candlestick data for charting."""
    params = {
        "chainIndex": chain_index,
        "tokenContractAddress": token_address.lower(),
        "bar": bar,
        "limit": str(limit)
    }
    data = okx.request("GET", "/api/v6/dex/market/historical-candles", params=params)
    return data

# --- Category E: NFTs & DeFi ---

@app.get("/portfolio/{address}/nfts")
def get_nft_portfolio(address: str):
    """Returns all NFTs owned by the address on X Layer."""
    address = address.strip()
    params = {
        "address": address,
        "chain": "xlayer"
    }
    # Marketplace NFT Portfolio (Direct path for address-based list)
    data = okx.request("GET", "/api/v5/mktplace/nft/asset/portfolio", params=params)
    return data

@app.get("/portfolio/{address}/defi")
def get_defi_positions(address: str):
    """Retrieve staked assets and yield positions using the v6 platform list."""
    address = address.strip()
    # This endpoint is a POST and requires a body as per docs
    body = {
        "walletAddressList": [
            {
                "chainIndex": "196", # X Layer
                "walletAddress": address
            }
        ]
    }
    data = okx.request("POST", "/api/v6/defi/user/asset/platform/list", body=body)
    return data

@app.post("/portfolio/{address}/defi/detail")
def get_defi_holdings_detail(address: str, platform_id: str):
    """Fetch in-depth details for a specific DeFi platform holding."""
    body = {
        "walletAddressList": [
            {
                "chainIndex": "196",
                "walletAddress": address.strip()
            }
        ],
        "analysisPlatformId": platform_id
    }
    data = okx.request("POST", "/api/v6/defi/user/asset/platform/detail", body=body)
    return data

# --- Category H: DeFi Discovery ---

@app.post("/defi/search")
def search_defi_products(query: str = "", chain_id: str = "196"):
    """Search for investment products (Staking, LP, etc.) on X Layer."""
    body = {
        "chainIndex": chain_id,
        "query": query
    }
    data = okx.request("POST", "/api/v6/defi/product/search", body=body)
    return data

@app.get("/defi/product/{product_id}")
def get_defi_product_detail(product_id: str):
    """Get detailed facts about a specific DeFi investment product."""
    params = {"investmentId": product_id}
    data = okx.request("GET", "/api/v6/defi/product/detail", params=params)
    return data

@app.get("/defi/product/{product_id}/apy")
def get_defi_apy_chart(product_id: str):
    """Fetch historical APY data for charting."""
    params = {"investmentId": product_id}
    data = okx.request("GET", "/api/v6/defi/product/rate/chart", params=params)
    return data

@app.get("/defi/product/{product_id}/tvl")
def get_defi_tvl_chart(product_id: str):
    """Fetch historical TVL data for charting."""
    params = {"investmentId": product_id}
    data = okx.request("GET", "/api/v6/defi/product/tvl/chart", params=params)
    return data

# --- Category I: AI Agent (Nexus-Sentry) ---

class ChatRequest(BaseModel):
    message: str
    wallet_address: str
    chain_id: int = 196
    history: Optional[List[dict]] = []

class DonationSettleRequest(BaseModel):
    x402Version: int = 1
    chainIndex: str = "196"
    paymentPayload: dict
    paymentRequirements: dict

@app.post("/donate/settle")
def donate_settle(request: DonationSettleRequest):
    """Settle an x402 protocol payment for donations."""
    try:
        print(f"[Donation] Settlement request received")
        body = {
            "x402Version": request.x402Version,
            "chainIndex": request.chainIndex,
            "syncSettle": True,
            "paymentPayload": request.paymentPayload,
            "paymentRequirements": request.paymentRequirements
        }
        data = okx.request("POST", "/api/v6/x402/settle", body=body)
        return data
    except Exception as e:
        print(f"DONATION ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Donation Settlement Error: {str(e)}")

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    """Chat with Nexus-Sentry AI Co-Pilot."""
    try:
        # Gemini often takes a few seconds, adding print for server-side visibility
        print(f"[Chat] Request from {request.wallet_address}")
        
        if not os.getenv("GEMINI_API_KEY"):
            raise ValueError("GEMINI_API_KEY is not set in the environment")

        result = chat_with_sentry(
            message=request.message,
            wallet_address=request.wallet_address,
            chain_id=request.chain_id,
            chat_history=request.history
        )
        return result
    except Exception as e:
        print(f"AI ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Sentry Intelligence Service Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
