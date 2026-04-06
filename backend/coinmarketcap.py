import os
import requests
from dotenv import load_dotenv

# load .env file
load_dotenv()

# set variables
api_key = os.getenv("X-CMC_PRO_API_KEY")
fear_greed_index = "https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest"
market_stats = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest"

# set headers
headers = {"X-CMC_PRO_API_KEY": api_key}

fear_greed_index_response = requests.get(fear_greed_index, headers=headers)
market_stats_response = requests.get(market_stats, headers=headers)

print(fear_greed_index_response.text)
print(market_stats_response.text)