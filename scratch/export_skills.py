import os
import json
import inspect
from backend.agent_utils import tools

def export_tools():
    base_dir = "agentic-skills"
    categories = {
        "wallet-intelligence": ["get_user_portfolio", "get_pnl_analysis", "get_defi_positions", "get_nft_portfolio"],
        "market-ops": ["fetch_swap_quote", "get_market_analysis", "get_token_price", "get_historical_candles"],
        "system-sync": ["trigger_metadata_sync"],
        "defi-discovery": ["research_yield"]
    }

    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    # Simplified extraction of function metadata for JSON schema representation
    for category, func_names in categories.items():
        cat_dir = os.path.join(base_dir, category)
        if not os.path.exists(cat_dir):
            os.makedirs(cat_dir)
        
        for name in func_names:
            # Find the function in the tools list
            func = next((t for t in tools if t.__name__ == name), None)
            if not func:
                continue
            
            sig = inspect.signature(func)
            doc = inspect.getdoc(func) or "No description provided."
            
            properties = {}
            required = []
            
            for param_name, param in sig.parameters.items():
                param_type = "string" # Default for most blockchain params
                if param.annotation == int:
                    param_type = "integer"
                elif param.annotation == float:
                    param_type = "number"
                
                properties[param_name] = {
                    "type": param_type,
                    "description": f"Parameter: {param_name}"
                }
                
                if param.default is inspect.Parameter.empty:
                    required.append(param_name)
            
            schema = {
                "name": name,
                "description": doc,
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required
                }
            }
            
            filepath = os.path.join(cat_dir, f"{name}.json")
            with open(filepath, "w") as f:
                json.dump(schema, f, indent=2)
            print(f"Exported {name} to {filepath}")

if __name__ == "__main__":
    export_tools()
