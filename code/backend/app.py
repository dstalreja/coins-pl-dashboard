from flask import Flask, jsonify, render_template, request, redirect, url_for
from flask_cors import CORS
from datetime import datetime
import uuid
import yfinance as yf
import json
import os
from functools import wraps
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = Flask(__name__)
CORS(app)

# Data files are stored in the data/ directory at the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
TRADES_FILE = os.path.join(DATA_DIR, "trades.json")
CLOSED_TRADES_FILE = os.path.join(DATA_DIR, "closed-trades.json")

# Auth Configuration
ALLOWED_EMAILS = os.environ.get("ALLOWED_EMAILS", "").split(",")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No token provided"}), 401
        
        try:
            token = auth_header.split(" ")[1]
            # Verify token (skip clock skew check for simplicity in dev if needed, but standard is fine)
            # If Client ID is not set in env, we skip audience check (less secure but works for dev if IDs match)
            id_info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            
            email = id_info.get('email')
            if email not in ALLOWED_EMAILS:
                 print(f"Unauthorized access attempt by: {email}")
                 return jsonify({"error": "Unauthorized email"}), 403
            
        except Exception as e:
            print(f"Token verification failed: {e}")
            return jsonify({"error": "Invalid token"}), 401
            
        return f(*args, **kwargs)
    return decorated_function

def load_trades():
    if not os.path.exists(TRADES_FILE):
        return []
    with open(TRADES_FILE, "r") as f:
        return json.load(f)

def save_trades(trades):
    with open(TRADES_FILE, "w") as f:
        json.dump(trades, f, indent=2)

def get_live_price(ticker: str) -> float:
    try:
        data = yf.Ticker(ticker).history(period="1d")
        if data.empty:
            print(f"No price data for {ticker}")
            return 0.0
        return float(data["Close"].iloc[-1])
    except Exception as e:
        print(f"Error fetching price for {ticker}: {e}")
        return 0.0

def calculate_pl(trade: dict) -> dict:
    trade_id = trade.get("id") # Get ID
    ticker = trade["ticker"]
    entry = float(trade["entry_price"])
    shares = float(trade["shares"])
    position_direction = trade["position_type"] # OW/UW or LONG/SHORT

    live_price = get_live_price(ticker)
    
    # Handle Live Price 0 case
    if live_price == 0:
         return {
            "id": trade_id,
            "ticker": ticker,
            "entry_price": entry,
            "live_price": 0,
            "shares": shares,
            "unrealized_pl": 0,
            "unrealized_pl_pct": 0,
            "position_type": position_direction,
            "position_amount": trade.get("position_amount"),
            "error": "Failed to fetch price"
        }

    pl = (live_price - entry) * shares
    pl_pct = ((live_price - entry) / entry) * 100 if entry != 0 else 0
    
    if position_direction == 'UW' or position_direction == 'SHORT':
        pl_pct = -(pl_pct)
        pl = -(pl)

    return {
        "id": trade_id,
        "ticker": ticker,
        "entry_price": entry,
        "live_price": round(live_price, 2),
        "shares": shares,
        "unrealized_pl": round(pl, 2),
        "unrealized_pl_pct": round(pl_pct, 2),
        "position_type": position_direction,
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

@app.post("/add-trade")
@verify_token
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

@app.delete("/api/trades/<trade_id>")
@verify_token
def delete_trade(trade_id):
    trades = load_trades()
    original_count = len(trades)
    trades = [t for t in trades if t.get("id") != trade_id]
    
    if len(trades) == original_count:
        return jsonify({"error": "Trade not found"}), 404
        
    save_trades(trades)
    return jsonify({"status": "success", "deleted": trade_id}), 200

def load_closed_trades():
    if not os.path.exists(CLOSED_TRADES_FILE):
        return []
    with open(CLOSED_TRADES_FILE, "r") as f:
        return json.load(f)

def save_closed_trades(closed):
    with open(CLOSED_TRADES_FILE, "w") as f:
        json.dump(closed, f, indent=2)

@app.post("/api/close-trade")
@verify_token
def close_trade():
    data = request.json
    trade_id = data.get("trade_id")
    manual_price = data.get("close_price") # Optional

    print(f"Closing trade: {trade_id}, Price: {manual_price}")

    if not trade_id:
        return jsonify({"error": "Trade ID is required"}), 400

    trades = load_trades()
    target_trade = next((t for t in trades if t.get("id") == trade_id), None)

    if not target_trade:
        return jsonify({"error": "Trade not found"}), 404

    # Determine Close Price
    if manual_price:
        close_price = float(manual_price)
    else:
        close_price = get_live_price(target_trade["ticker"])

    # Create Closed Trade Record
    closed_trade = {
        **target_trade,
        "closePrice": round(close_price, 2),
        "closeDate": datetime.utcnow().isoformat(),
        "closed": True
    }

    # Save to Closed History
    closed_trades = load_closed_trades()
    closed_trades.append(closed_trade)
    save_closed_trades(closed_trades)

    # Remove from Active Trades
    remaining_trades = [t for t in trades if t.get("id") != trade_id]
    save_trades(remaining_trades)

    return jsonify({"status": "success", "closed": trade_id, "price": close_price}), 200

@app.get("/api/closed")
def get_closed_trades():
    if not os.path.exists(CLOSED_TRADES_FILE):
        return jsonify([])
    with open(CLOSED_TRADES_FILE, "r") as f:
        data = json.load(f)
        return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
