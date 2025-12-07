# Tests

This directory contains test scripts and files demonstrating how the code was verified.

## Test Files

- `test_app.py` - Comprehensive test suite for Flask backend API endpoints
- `test_helpers.py` - Helper functions and utilities for testing
- `requirements.txt` - Test dependencies (pytest, pytest-mock, pytest-cov)

## Test Coverage

The test suite covers:

1. **Core Functions**:
   - `get_live_price()` - Price retrieval from Yahoo Finance
   - `calculate_pl()` - Profit/Loss calculations for OW and UW positions

2. **API Endpoints**:
   - `GET /api/trades` - Retrieve all open trades
   - `GET /api/pl` - Get profit/loss calculations for all trades
   - `GET /api/closed` - Retrieve closed trade history
   - `POST /add-trade` - Add a new trade
   - `POST /api/close-trade` - Close an existing trade
   - `GET /` - Index page
   - `GET /add-trade` - Add trade page

3. **Edge Cases**:
   - Missing price data
   - Invalid tickers
   - Missing required fields
   - Empty trade lists
   - Ticker case normalization

## How to Run the Tests

### Prerequisites

1. Install test dependencies:
   ```bash
   cd tests
   pip install -r requirements.txt
   ```

   Or install from the project root:
   ```bash
   pip install pytest pytest-mock pytest-cov
   ```

### Running Tests

1. **Run all tests**:
   ```bash
   pytest tests/ -v
   ```

2. **Run with coverage report**:
   ```bash
   pytest tests/ --cov=code/backend --cov-report=html -v
   ```

3. **Run a specific test file**:
   ```bash
   pytest tests/test_app.py -v
   ```

4. **Run a specific test class**:
   ```bash
   pytest tests/test_app.py::TestCalculatePL -v
   ```

5. **Run a specific test function**:
   ```bash
   pytest tests/test_app.py::TestCalculatePL::test_calculate_pl_overweight -v
   ```

### Test Output

The tests use mocking to avoid making real API calls to Yahoo Finance during testing. All external dependencies (yfinance) are mocked to ensure:
- Tests run quickly
- Tests are reliable (no network dependency)
- Tests can simulate error conditions

### Expected Results

When all tests pass, you should see output like:
```
tests/test_app.py::TestGetLivePrice::test_get_live_price_success PASSED
tests/test_app.py::TestGetLivePrice::test_get_live_price_no_data PASSED
tests/test_app.py::TestCalculatePL::test_calculate_pl_overweight PASSED
...
========================= X passed in Y.YYs =========================
```

## Test Structure

- **Unit Tests**: Test individual functions in isolation
- **Integration Tests**: Test API endpoints with mocked dependencies
- **Helper Functions**: Reusable utilities for creating test data

## Notes

- Tests use temporary directories and mock data to avoid modifying production data files
- All external API calls (yfinance) are mocked to ensure test reliability
- Tests verify both success cases and error handling

