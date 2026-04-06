import os
import hmac
import hashlib
import base64
import requests
import json
from datetime import datetime, timezone
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

class OKXClient:
    def __init__(self):
        self.api_key = os.getenv("OKX_API_KEY", "").strip()
        self.secret_key = os.getenv("OKX_SECRET_KEY", "").strip()
        self.passphrase = os.getenv("OKX_PASSPHRASE", "").strip()
        self.base_url = "https://web3.okx.com"

    def _generate_signature(self, timestamp, method, request_path, body_str=""):
        if not self.secret_key:
            raise ValueError("OKX_SECRET_KEY not found in environment")
            
        prehash_str = f"{timestamp}{method}{request_path}{body_str}"
        mac = hmac.new(self.secret_key.encode('utf-8'), 
                      prehash_str.encode('utf-8'), 
                      digestmod=hashlib.sha256)
        return base64.b64encode(mac.digest()).decode('utf-8')

    def request(self, method, endpoint, params=None, body=None):
        timestamp = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
        
        # Determine the JSON body string for signature (compact format)
        body_str = ""
        if body:
            body_str = json.dumps(body, separators=(',', ':'))
        
        # Prepare the request
        req = requests.Request(method, f"{self.base_url}{endpoint}", params=params, data=body_str)
        prepared = req.prepare()
        
        # Extract the exact path + query string
        url_obj = urlparse(prepared.url)
        request_path = url_obj.path
        if url_obj.query:
            request_path += f"?{url_obj.query}"
        
        signature = self._generate_signature(timestamp, method.upper(), request_path, body_str)
        
        headers = {
            "OK-ACCESS-KEY": self.api_key,
            "OK-ACCESS-SIGN": signature,
            "OK-ACCESS-TIMESTAMP": timestamp,
            "OK-ACCESS-PASSPHRASE": self.passphrase,
            "Content-Type": "application/json"
        }
        
        session = requests.Session()
        prepared.headers.update(headers)
        response = session.send(prepared)
        return response.json()
