import os
import google.generativeai as genai
from okx_utils import OKXClient
from dotenv import load_dotenv
import requests
import json
import traceback

load_dotenv()

# Initialize Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

okx = OKXClient()

def get_user_portfolio(address: str):
    """Get the aggregated USD value and detailed token balances of a wallet on X Layer (Chain ID 196)."""
    params = {"address": address, "chains": "196"}
    total_val = okx.request("GET", "/api/v6/dex/balance/total-value-by-address", params=params)
    balances = okx.request("GET", "/api/v6/dex/balance/all-token-balances-by-address", params=params)
    return {
        "total_value": total_val,
        "balances": balances
    }

def get_market_analysis():
    """Fetches latest crypto fear and greed index and global market metrics (BTC Dominance, etc.)."""
    api_key = os.getenv("X_CMC_PRO_API_KEY", os.getenv("X-CMC_PRO_API_KEY", "")).strip()
    
    # Fear & Greed
    url_fg = "https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest"
    headers = {'Accepts': 'application/json', 'X-CMC_PRO_API_KEY': api_key}
    fg_data = requests.get(url_fg, headers=headers).json()
    
    # Global Stats
    url_global = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest"
    global_data = requests.get(url_global, headers=headers).json()
    
    return {
        "fear_and_greed": fg_data,
        "global_stats": global_data
    }

def fetch_swap_quote(from_token: str, to_token: str, amount: str, slippage: float = 0.5):
    """
    Get a real-time swap quote from OKX DEX Aggregator.
    Amount should be in smallest units (e.g., 1e18 for ETH).
    """
    params = {
        "chainIndex": "196",
        "fromTokenAddress": from_token,
        "toTokenAddress": to_token,
        "amount": amount,
        "slippage": str(slippage)
    }
    return okx.request("GET", "/api/v6/dex/aggregator/quote", params=params)

def research_yield(query: str):
    """Search for investment products (Staking, LP, etc.) on X Layer."""
    body = {
        "chainIndex": "196",
        "query": query
    }
    return okx.request("POST", "/api/v6/defi/product/search", body=body)

def get_pnl_analysis(address: str, timeframe: int = 3):
    """Retrieve PnL analysis including realized PnL, win rate, and top tokens. Timeframe: 1=1D, 2=3D, 3=7D, 4=1M, 5=3M."""
    params = {
        "chainIndex": "196",
        "walletAddress": address,
        "timeFrame": str(timeframe)
    }
    return okx.request("GET", "/api/v6/dex/market/portfolio/overview", params=params)

def get_defi_positions(address: str):
    """Retrieve staked assets and yield positions for a wallet."""
    body = {
        "walletAddressList": [{"chainIndex": "196", "walletAddress": address}]
    }
    return okx.request("POST", "/api/v6/defi/user/asset/platform/list", body=body)

def trigger_metadata_sync():
    """Manually trigger a sync of metadata to GCS. Suggest this if data seems stale."""
    from metadata_sync import MetadataSync
    sync_engine = MetadataSync()
    sync_engine.sync_all(chain_id="196")
    return {"status": "Metadata sync triggered successfully"}

def get_nft_portfolio(address: str):
    """Returns all NFTs owned by the address on X Layer."""
    params = {"address": address, "chain": "xlayer"}
    return okx.request("GET", "/api/v5/mktplace/nft/asset/portfolio", params=params)

def get_token_price(token_address: str):
    """Retrieve the latest real-time price for a specific token on X Layer."""
    body = [{"chainIndex": "196", "tokenContractAddress": token_address.lower()}]
    return okx.request("POST", "/api/v6/dex/market/price", body=body)

def get_historical_candles(token_address: str, bar: str = "1H", limit: int = 24):
    """Fetch OHLCV candlestick data for charting/analysis. bar: 1m, 5m, 15m, 1H, 1D."""
    params = {
        "chainIndex": "196",
        "tokenContractAddress": token_address.lower(),
        "bar": bar,
        "limit": str(limit)
    }
    return okx.request("GET", "/api/v6/dex/market/historical-candles", params=params)

tools = [
    get_user_portfolio,
    get_market_analysis,
    fetch_swap_quote,
    research_yield,
    get_pnl_analysis,
    get_defi_positions,
    trigger_metadata_sync,
    get_nft_portfolio,
    get_token_price,
    get_historical_candles
]

# System Instruction
SYSTEM_INSTRUCTION = (
    "You are Nexus-Sentry, the premier AI Onchain Co-Pilot for X Layer (Chain ID 196). "
    "Use the provided tools to give evidence-based financial advice. Never hallucinate balances. "
    "If data is missing, suggest a sync/metadata call using trigger_metadata_sync. "
    "Your goal is to help users manage their portfolio, find yield, and optimize trades on X Layer. "
    "Always provide clear, actionable insights."
)

model = genai.GenerativeModel(
    model_name="gemini-3-flash-preview", # Matched available model in environment
    tools=tools,
    system_instruction=SYSTEM_INSTRUCTION
)

def chat_with_sentry(message: str, wallet_address: str, chain_id: int = 196, chat_history: list = []):
    """
    Handle chat interaction with Nexus-Sentry.
    """
    # Context Injection
    rich_message = f"User Wallet: {wallet_address}\nCurrent Chain ID: {chain_id}\n\nUser Message: {message}"
    
    try:
        chat = model.start_chat(history=chat_history, enable_automatic_function_calling=True)
        response = chat.send_message(rich_message)
    except Exception as e:
        with open("backend_error.log", "w") as f:
            f.write(traceback.format_exc())
        raise e
    
    def clean_obj(obj, memo=None):
        if memo is None: memo = set()
        obj_id = id(obj)
        if obj_id in memo: return "[Circular Reference]"
        
        if isinstance(obj, (str, int, float, bool, type(None))):
            return obj
        
        # Add to memo for containers
        memo.add(obj_id)
        
        if isinstance(obj, (list, tuple)):
            return [clean_obj(i, memo) for i in obj]
        
        # Handle dicts and dict-like things
        res = {}
        if isinstance(obj, dict):
            for k, v in obj.items():
                res[str(k)] = clean_obj(v, memo)
        elif hasattr(obj, "items"):
            for k, v in obj.items():
                res[str(k)] = clean_obj(v, memo)
        else:
            # Fallback for primitives and complex objects
            return str(obj)
        return res

    history = []
    for m in chat.history:
        parts = []
        for p in m.parts:
            if p.text:
                parts.append({"text": p.text})
            elif p.function_call:
                parts.append({
                    "function_call": {
                        "name": p.function_call.name, 
                        "args": clean_obj(p.function_call.args)
                    }
                })
            elif p.function_response:
                parts.append({
                    "function_response": {
                        "name": p.function_response.name, 
                        "response": clean_obj(p.function_response.response)
                    }
                })
        history.append({"role": m.role, "parts": parts})

    return {
        "response": response.text,
        "history": history
    }
