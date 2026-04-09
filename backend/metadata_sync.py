from okx_utils import OKXClient
from gcs_utils import GCSClient

class MetadataSync:
    def __init__(self):
        self.okx = OKXClient()
        self.gcs = GCSClient()

    def sync_all(self, chain_id="196"):
        """Syncs Tokens, Chains, and Liquidity for a specific chainIndex."""
        results = {}
        
        # 1. Sync Tokens (The most important file)
        tokens_raw = self.okx.request("GET", "/api/v6/dex/aggregator/all-tokens", params={"chainIndex": chain_id})
        if tokens_raw.get("code") == "0":
            data = tokens_raw.get("data", [])
            if data:
                print(f"DEBUG - First token keys: {data[0].keys()}")
                print(f"DEBUG - First token content: {data[0]}")
            
            # CLEANING: Strip unnecessary metadata
            cleaned_tokens = []
            for t in data:
                cleaned_tokens.append({
                    "s": t.get("tokenSymbol"),
                    "n": t.get("tokenName"),
                    "a": t.get("tokenContractAddress"),
                    "d": t.get("decimals"),
                    "l": t.get("tokenLogoUrl")
                })
            results["tokens"] = self.gcs.upload_json(cleaned_tokens, f"tokens_{chain_id}.json")

        # 2. Sync Chains
        chains_raw = self.okx.request("GET", "/api/v6/dex/aggregator/supported/chain")
        if chains_raw.get("code") == "0":
            results["chains"] = self.gcs.upload_json(chains_raw.get("data"), "chains.json")

        # 3. Sync Liquidity (DEX Sources)
        liq_raw = self.okx.request("GET", "/api/v6/dex/aggregator/get-liquidity", params={"chainIndex": chain_id})
        if liq_raw.get("code") == "0":
            results["liquidity"] = self.gcs.upload_json(liq_raw.get("data"), f"liquidity_{chain_id}.json")

        return results

if __name__ == "__main__":
    sync = MetadataSync()
    print(sync.sync_all())
