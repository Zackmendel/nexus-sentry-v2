import requests
import os
import hmac
import hashlib
import base64
from datetime import datetime, timezone
from urllib.parse import urlencode
from dotenv import load_dotenv

load_dotenv()

def get_xlayer_portfolio(wallet_address):
    # 1. Setup Request Details
    method = "GET"
    base_url = "https://web3.okx.com"
    # Updated to the v6 endpoint
    endpoint = "/api/v6/dex/balance/total-value-by-address"
    params = {
        "address": wallet_address,
        "chains": "196" # X Layer Mainnet
    }
    
    # 2. Prepare Timestamp
    # Format: 2020-12-08T09:08:57.715Z
    timestamp = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
    
    # 3. Prepare Request Path (Endpoint + Query String)
    query_string = urlencode(params)
    request_path = f"{endpoint}?{query_string}"
    
    # 4. Generate Signature
    # Pre-hash string: timestamp + method + requestPath + body (body is empty for GET)
    prehash_str = f"{timestamp}{method}{request_path}"
    
    secret_key = os.getenv("OKX_SECRET_KEY")
    mac = hmac.new(secret_key.encode('utf-8'), 
                  prehash_str.encode('utf-8'), 
                  digestmod=hashlib.sha256)
    signature = base64.b64encode(mac.digest()).decode('utf-8')
    
    # 5. Set Headers
    headers = {
        "OK-ACCESS-KEY": os.getenv("OKX_API_KEY"),
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": os.getenv("OKX_PASSPHRASE"),
        "Content-Type": "application/json"
    }
    
    # 6. Execute Request
    response = requests.get(f"{base_url}{endpoint}", params=params, headers=headers)
    return response.json()

# Example usage:
print(get_xlayer_portfolio("0x0d8AA7818E3512629A232449f5Ae8fA72Fd68bc8"))