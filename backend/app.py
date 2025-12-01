from flask import Flask, jsonify, render_template, request, redirect, url_for
from flask_cors import CORS
from datetime import datetime
import uuid
import yfinance as yf
import json
import os

app = Flask(__name__)
CORS(app)

TRADES_FILE = os.path.join(os.path.dirname(__file__), "trades.json")
CLOSED_TRADES_FILE = os.path.join(os.path.dirname(__file__), "closed-trades.json")

def load_trades():
    with open(TRADES_FILE, "r") as f:
        return json.load(f)


def save_trades(trades):
    with open(TRADES_FILE, "w") as f:
        json.dump(trades, f, indent=2)


def get_live_price(ticker: str) -> float:
    data = yf.Ticker(ticker).history(period="1d")
    if data.empty:
        raise ValueError(f"No price data for {ticker}")
    return float(data["Close"].iloc[-1])


def calculate_pl(trade: dict) -> dict:
    ticker = trade["ticker"]
    entry = float(trade["entry_price"])
    shares = float(trade["shares"])
    position_direction = trade["position_type"]

    live_price = get_live_price(ticker)
    pl = (live_price - entry) * shares
    pl_pct = ((live_price - entry) / entry) * 100 if entry != 0 else 0
    if position_direction == 'UW':
        pl_pct = -(pl_pct)
        pl = -(pl)

    # include new OW/UW fields
    return {
        "ticker": ticker,
        "entry_price": entry,
        "live_price": round(live_price, 2),
        "shares": shares,
        "unrealized_pl": round(pl, 2),
        "unrealized_pl_pct": round(pl_pct, 2),
        "position_type": trade.get("position_type"),
        "position_amount": trade.get("position_amount")
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/api/trades")
def get_trades():
    return jsonify(load_trades())


@app.get("/api/pl")
def api_pl():
    trades = load_trades()
    enriched = []

    for t in trades:
        try:
            enriched.append(calculate_pl(t))
        except Exception as e:
            enriched.append({"ticker": t["ticker"], "error": str(e)})

    return jsonify(enriched)

@app.get("/add-trade")
def add_trade_page():
    return render_template("add_trade.html")  # serves your Bootstrap form

@app.post("/add-trade")
def add_trade():
    data = request.get_json()

    new_trade = {
        "id": str(uuid.uuid4()),
        "ticker": data["ticker"].upper().strip(),
        "entry_price": float(data["entry_price"]),
        "shares": float(data["shares"]),
        "position_type": data["position_type"],
        "position_amount": float(data["position_amount"]),
        "start_date": datetime.utcnow().isoformat()
    }

    trades = load_trades()
    trades.append(new_trade)
    save_trades(trades)

    return jsonify({"status": "success", "added": new_trade}), 201


def load_closed_trades():
    if not os.path.exists(CLOSED_TRADES_FILE):
        return []
    with open(CLOSED_TRADES_FILE, "r") as f:
        return json.load(f)

def save_closed_trades(closed):
    with open(CLOSED_TRADES_FILE, "w") as f:
        json.dump(closed, f, indent=2)

@app.post("/api/close-trade")
def close_trade():
    data = request.json
    ticker = data.get("ticker", "").upper().strip()

    with open(TRADES_FILE, "r") as f:
        trades = json.load(f)

    for t in trades:
        if t["ticker"].upper() == ticker:
            closed_trades = load_closed_trades()
            closed_trades.append({
                **t,
                "closePrice": round(get_live_price(ticker), 2),
                "closeDate": datetime.utcnow().isoformat(),
                "closed": True
            })
            save_closed_trades(closed_trades)
            break

    # remove from open trades
    open_trades = [t for t in trades if t["ticker"].upper() != ticker]
    with open(TRADES_FILE, "w") as f:
        json.dump(open_trades, f, indent=2)

    return jsonify({"status": "success", "closed": ticker}), 201


@app.get("/api/closed")
def get_closed_trades():
    if not os.path.exists(CLOSED_TRADES_FILE):
        return jsonify([])
    with open(CLOSED_TRADES_FILE, "r") as f:
        data = json.load(f)
        print("Closed trades loaded:", data)  # debugging
        return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
