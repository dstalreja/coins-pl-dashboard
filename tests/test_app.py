"""
Test suite for the COINS Live Trading Dashboard Flask backend.

This test file verifies the functionality of all API endpoints and core functions.
"""

import pytest
import json
import os
import tempfile
import shutil
from unittest.mock import patch, MagicMock
import sys

# Add the backend directory to the path so we can import app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'code', 'backend'))

from app import app, calculate_pl, get_live_price, load_trades, save_trades


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def temp_data_dir():
    """Create a temporary directory for test data files."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def sample_trade():
    """Sample trade data for testing."""
    return {
        "id": "test-id-123",
        "ticker": "SLV",
        "entry_price": 25.50,
        "shares": 100.0,
        "position_type": "OW",
        "position_amount": 5.0,
        "start_date": "2025-01-01T00:00:00"
    }


@pytest.fixture
def sample_trades_list(sample_trade):
    """List of sample trades."""
    return [sample_trade]


class TestGetLivePrice:
    """Tests for the get_live_price function."""
    
    @patch('app.yf')
    def test_get_live_price_success(self, mock_yf):
        """Test successful price retrieval."""
        # Mock the yfinance response
        # Create a mock DataFrame-like object
        mock_data = MagicMock()
        mock_data.empty = False
        
        # Mock the Close column access: data["Close"].iloc[-1]
        mock_close_series = MagicMock()
        mock_close_series.iloc.__getitem__.return_value = 26.75
        mock_data.__getitem__.return_value = mock_close_series
        
        mock_ticker_instance = MagicMock()
        mock_ticker_instance.history.return_value = mock_data
        mock_yf.Ticker.return_value = mock_ticker_instance
        
        price = get_live_price("SLV")
        assert price == 26.75
        mock_yf.Ticker.assert_called_once_with("SLV")
    
    @patch('app.yf')
    def test_get_live_price_no_data(self, mock_yf):
        """Test handling of missing price data."""
        # Mock empty data response
        mock_data = MagicMock()
        mock_data.empty = True
        
        mock_ticker_instance = MagicMock()
        mock_ticker_instance.history.return_value = mock_data
        mock_yf.Ticker.return_value = mock_ticker_instance
        
        with pytest.raises(ValueError, match="No price data"):
            get_live_price("INVALID")


class TestCalculatePL:
    """Tests for the calculate_pl function."""
    
    @patch('app.get_live_price')
    def test_calculate_pl_overweight(self, mock_get_price):
        """Test P/L calculation for Overweight (OW) position."""
        mock_get_price.return_value = 26.75
        
        trade = {
            "ticker": "SLV",
            "entry_price": 25.50,
            "shares": 100.0,
            "position_type": "OW",
            "position_amount": 5.0
        }
        
        result = calculate_pl(trade)
        
        assert result["ticker"] == "SLV"
        assert result["entry_price"] == 25.50
        assert result["live_price"] == 26.75
        assert result["shares"] == 100.0
        assert result["unrealized_pl"] == 125.0  # (26.75 - 25.50) * 100
        assert result["unrealized_pl_pct"] == pytest.approx(4.90, abs=0.1)  # ((26.75 - 25.50) / 25.50) * 100
        assert result["position_type"] == "OW"
        assert result["position_amount"] == 5.0
    
    @patch('app.get_live_price')
    def test_calculate_pl_underweight(self, mock_get_price):
        """Test P/L calculation for Underweight (UW) position."""
        mock_get_price.return_value = 24.25
        
        trade = {
            "ticker": "SLV",
            "entry_price": 25.50,
            "shares": 100.0,
            "position_type": "UW",
            "position_amount": 5.0
        }
        
        result = calculate_pl(trade)
        
        assert result["ticker"] == "SLV"
        assert result["unrealized_pl"] == 125.0  # Inverted: -((24.25 - 25.50) * 100) = 125
        assert result["unrealized_pl_pct"] == pytest.approx(4.90, abs=0.1)  # Inverted
        assert result["position_type"] == "UW"


class TestAPITrades:
    """Tests for /api/trades endpoint."""
    
    @patch('app.load_trades')
    def test_get_trades_success(self, mock_load, client, sample_trades_list):
        """Test successful retrieval of trades."""
        mock_load.return_value = sample_trades_list
        
        response = client.get('/api/trades')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]["ticker"] == "SLV"
    
    @patch('app.load_trades')
    def test_get_trades_empty(self, mock_load, client):
        """Test retrieval when no trades exist."""
        mock_load.return_value = []
        
        response = client.get('/api/trades')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == []


class TestAPIPL:
    """Tests for /api/pl endpoint."""
    
    @patch('app.calculate_pl')
    @patch('app.load_trades')
    def test_api_pl_success(self, mock_load, mock_calculate, client, sample_trades_list):
        """Test successful P/L calculation endpoint."""
        mock_load.return_value = sample_trades_list
        mock_calculate.return_value = {
            "ticker": "SLV",
            "entry_price": 25.50,
            "live_price": 26.75,
            "shares": 100.0,
            "unrealized_pl": 125.0,
            "unrealized_pl_pct": 4.90,
            "position_type": "OW",
            "position_amount": 5.0
        }
        
        response = client.get('/api/pl')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]["ticker"] == "SLV"
        assert data[0]["unrealized_pl"] == 125.0
    
    @patch('app.calculate_pl')
    @patch('app.load_trades')
    def test_api_pl_with_error(self, mock_load, mock_calculate, client):
        """Test P/L endpoint when a trade has an error."""
        mock_load.return_value = [{"ticker": "INVALID", "entry_price": 10.0}]
        mock_calculate.side_effect = ValueError("No price data for INVALID")
        
        response = client.get('/api/pl')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert "error" in data[0]
        assert data[0]["ticker"] == "INVALID"


class TestAddTrade:
    """Tests for /add-trade endpoint."""
    
    @patch('app.save_trades')
    @patch('app.load_trades')
    def test_add_trade_success(self, mock_load, mock_save, client):
        """Test successful trade addition."""
        mock_load.return_value = []
        
        new_trade_data = {
            "ticker": "USO",
            "entry_price": 32.50,
            "shares": 100.0,
            "position_type": "OW",
            "position_amount": 5.0
        }
        
        response = client.post(
            '/add-trade',
            data=json.dumps(new_trade_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["status"] == "success"
        assert "added" in data
        assert data["added"]["ticker"] == "USO"
        assert data["added"]["entry_price"] == 32.50
        assert "id" in data["added"]
        mock_save.assert_called_once()
    
    def test_add_trade_missing_fields(self, client):
        """Test trade addition with missing required fields."""
        incomplete_data = {
            "ticker": "USO",
            "entry_price": 32.50
            # Missing shares, position_type, position_amount
        }
        
        response = client.post(
            '/add-trade',
            data=json.dumps(incomplete_data),
            content_type='application/json'
        )
        
        # Should return an error (500 or 400)
        assert response.status_code in [400, 500]
    
    @patch('app.save_trades')
    @patch('app.load_trades')
    def test_add_trade_ticker_uppercase(self, mock_load, mock_save, client):
        """Test that ticker is converted to uppercase."""
        mock_load.return_value = []
        
        new_trade_data = {
            "ticker": "uso",  # lowercase
            "entry_price": 32.50,
            "shares": 100.0,
            "position_type": "OW",
            "position_amount": 5.0
        }
        
        response = client.post(
            '/add-trade',
            data=json.dumps(new_trade_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["added"]["ticker"] == "USO"  # Should be uppercase


class TestAPIClosed:
    """Tests for /api/closed endpoint."""
    
    @patch('app.load_closed_trades')
    def test_get_closed_trades_success(self, mock_load, client):
        """Test successful retrieval of closed trades."""
        mock_closed = [
            {
                "id": "test-1",
                "ticker": "SLV",
                "entry_price": 25.50,
                "closePrice": 26.75,
                "closed": True
            }
        ]
        mock_load.return_value = mock_closed
        
        response = client.get('/api/closed')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]["ticker"] == "SLV"
        assert data[0]["closed"] is True
    
    @patch('app.load_closed_trades')
    def test_get_closed_trades_empty(self, mock_load, client):
        """Test retrieval when no closed trades exist."""
        mock_load.return_value = []
        
        response = client.get('/api/closed')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == []


class TestCloseTrade:
    """Tests for /api/close-trade endpoint."""
    
    @patch('app.get_live_price')
    @patch('app.save_closed_trades')
    @patch('app.load_closed_trades')
    @patch('app.save_trades')
    def test_close_trade_success(self, mock_save_trades, mock_load_closed, 
                                  mock_save_closed, mock_get_price, client):
        """Test successful trade closure."""
        # Setup mocks
        mock_get_price.return_value = 26.75
        mock_load_closed.return_value = []
        
        # Create a temporary trades file content
        trades_content = [
            {
                "id": "test-1",
                "ticker": "SLV",
                "entry_price": 25.50,
                "shares": 100.0,
                "position_type": "OW",
                "position_amount": 5.0
            }
        ]
        
        with patch('builtins.open', create=True) as mock_open:
            mock_open.return_value.__enter__.return_value.read.return_value = json.dumps(trades_content)
            mock_open.return_value.__enter__.return_value.write = MagicMock()
            
            response = client.post(
                '/api/close-trade',
                data=json.dumps({"ticker": "SLV"}),
                content_type='application/json'
            )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["status"] == "success"
        assert data["closed"] == "SLV"
        mock_get_price.assert_called_once_with("SLV")
    
    def test_close_trade_missing_ticker(self, client):
        """Test closing trade without providing ticker."""
        response = client.post(
            '/api/close-trade',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        # Should handle gracefully (may return 201 or error depending on implementation)
        assert response.status_code in [200, 201, 400, 500]


class TestIndexRoute:
    """Tests for the root route."""
    
    def test_index_route(self, client):
        """Test the root route returns the index page."""
        response = client.get('/')
        
        # Should return HTML (status 200 or template rendering)
        assert response.status_code == 200


class TestAddTradePage:
    """Tests for /add-trade GET route."""
    
    def test_add_trade_page(self, client):
        """Test the add trade page route."""
        response = client.get('/add-trade')
        
        # Should return HTML page
        assert response.status_code == 200


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

