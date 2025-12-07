"""
Helper functions and utilities for testing the COINS Trading Dashboard.
"""

import json
import os
import tempfile
from typing import List, Dict


def create_test_trade(ticker: str = "SLV", entry_price: float = 25.50, 
                     shares: float = 100.0, position_type: str = "OW",
                     position_amount: float = 5.0) -> Dict:
    """
    Create a sample trade dictionary for testing.
    
    Args:
        ticker: Stock ticker symbol
        entry_price: Entry price of the trade
        shares: Number of shares
        position_type: "OW" (Overweight) or "UW" (Underweight)
        position_amount: Position amount as percentage
    
    Returns:
        Dictionary representing a trade
    """
    return {
        "id": f"test-{ticker.lower()}",
        "ticker": ticker.upper(),
        "entry_price": entry_price,
        "shares": shares,
        "position_type": position_type,
        "position_amount": position_amount,
        "start_date": "2025-01-01T00:00:00"
    }


def create_test_closed_trade(ticker: str = "SLV", entry_price: float = 25.50,
                            close_price: float = 26.75, shares: float = 100.0) -> Dict:
    """
    Create a sample closed trade dictionary for testing.
    
    Args:
        ticker: Stock ticker symbol
        entry_price: Entry price of the trade
        close_price: Closing price of the trade
        shares: Number of shares
    
    Returns:
        Dictionary representing a closed trade
    """
    trade = create_test_trade(ticker, entry_price, shares)
    trade["closePrice"] = close_price
    trade["closeDate"] = "2025-01-02T00:00:00"
    trade["closed"] = True
    return trade


def save_test_data_file(filepath: str, data: List[Dict]) -> None:
    """
    Save test data to a JSON file.
    
    Args:
        filepath: Path to the JSON file
        data: List of dictionaries to save
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


def load_test_data_file(filepath: str) -> List[Dict]:
    """
    Load test data from a JSON file.
    
    Args:
        filepath: Path to the JSON file
    
    Returns:
        List of dictionaries loaded from the file
    """
    if not os.path.exists(filepath):
        return []
    
    with open(filepath, 'r') as f:
        return json.load(f)


def calculate_expected_pl(entry_price: float, live_price: float, 
                         shares: float, position_type: str) -> tuple:
    """
    Calculate expected profit/loss for testing purposes.
    
    Args:
        entry_price: Entry price
        live_price: Current live price
        shares: Number of shares
        position_type: "OW" or "UW"
    
    Returns:
        Tuple of (unrealized_pl, unrealized_pl_pct)
    """
    pl = (live_price - entry_price) * shares
    pl_pct = ((live_price - entry_price) / entry_price) * 100 if entry_price != 0 else 0
    
    if position_type == 'UW':
        pl = -pl
        pl_pct = -pl_pct
    
    return (round(pl, 2), round(pl_pct, 2))

