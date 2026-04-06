from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from okx_utils import OKXClient
import requests
import os

app = FastAPI(title="X Layer Portfolio API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust this for production (e.g., your specific GCP frontend domain)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

okx = OKXClient()

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
    cmc_key = os.getenv("X-CMC_PRO_API_KEY")
    url = "https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest"
    headers = {"X-CMC_PRO_API_KEY": cmc_key}
    response = requests.get(url, headers=headers)
    return response.json()

@app.get("/market/global-stats")
def get_global_metrics():
    """Fetches global market quotes (Total Market Cap, BTC Dominance, etc.)."""
    cmc_key = os.getenv("X-CMC_PRO_API_KEY")
    url = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest"
    headers = {"X-CMC_PRO_API_KEY": cmc_key}
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
