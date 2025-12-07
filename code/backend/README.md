# COINS Live P/L Dashboard

Small Flask web app to monitor unrealized P/L for open COINS trades using Yahoo Finance (yfinance).

## Setup

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Then open http://127.0.0.1:5000 in your browser.

## Configure Trades

Edit `trades.json` to reflect the current open COINS trades:

```json
[
  {
    "ticker": "SLV",
    "entry_price": 23.50,
    "shares": 150
  }
]
```

This is an educational tool for internal club use only and does not constitute trading or investment advice.


To add trade (example, can use form too):
curl -X POST http://127.0.0.1:5000/add-trade \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SLV","entry_price":27.40,"shares":50,"position_type":"OW","position_amount":5}'

To close trade (example):
curl -X POST http://127.0.0.1:5000/api/close-trade \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SLV"}'

To delete trade (example):
curl -X POST http://127.0.0.1:5000/api/delete-trade \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SLV"}'
