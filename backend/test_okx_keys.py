from okx_utils import OKXClient
import json

def test_okx_keys():
    okx = OKXClient()
    print("Fetching tokens for X Layer (196)...")
    res = okx.request("GET", "/api/v6/dex/aggregator/all-tokens", params={"chainIndex": "196"})
    
    if res.get("code") == "0":
        data = res.get("data", [])
        if data:
            print("\n--- RAW TOKEN DATA (First Item) ---")
            print(json.dumps(data[0], indent=2))
        else:
            print("No data returned.")
    else:
        print(f"Error: {res}")

if __name__ == "__main__":
    test_okx_keys()
