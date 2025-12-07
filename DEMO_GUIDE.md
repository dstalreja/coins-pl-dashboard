# Demo Guide - COINS Live Trading Dashboard

Quick guide to run the project for a demonstration.

## Option 1: Run Locally (Recommended for Demo)

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ and npm installed
- Two terminal windows/tabs

### Step 1: Start the Backend (Terminal 1)

```bash
# Navigate to backend directory
cd code/backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

✅ Backend is now running on `http://127.0.0.1:5000`

### Step 2: Start the Frontend (Terminal 2)

```bash
# Navigate to frontend directory
cd code/frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
  VITE v6.3.5  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ Frontend is now running on `http://localhost:3000`

### Step 3: Open in Browser

1. Open your browser
2. Navigate to: **http://localhost:3000**
3. You should see the COINS Live Trading Dashboard!

---

## Option 2: Use Production Deployment (Easiest for Demo)

If you've already deployed to Vercel and Render:

1. **Frontend**: Open your Vercel deployment URL
2. **Backend**: Already running on Render (https://coins-pl-dashboard.onrender.com)

**No local setup needed!** Just open the Vercel URL in your browser.

---

## Demo Checklist

### Before Starting Demo:

- [ ] Backend is running (check Terminal 1)
- [ ] Frontend is running (check Terminal 2)
- [ ] Browser is open to http://localhost:3000
- [ ] Data files exist in `data/` directory:
  - `data/trades.json` (should have at least one trade)
  - `data/closed-trades.json` (optional, for past trades)
  - `data/portfolio_placeholder.xlsx` (for analytics)

### Demo Flow:

1. **Dashboard Page** (Default)
   - Show live trades table
   - Point out auto-refresh (every 15 seconds)
   - Show P/L calculations
   - Explain OW (Overweight) vs UW (Underweight) positions

2. **Past Trades Page**
   - Click "Past Trades" in sidebar
   - Show closed trades grouped by date
   - Explain realized P/L

3. **Portfolio Analytics Page**
   - Click "Portfolio Analytics" in sidebar
   - Show performance charts
   - Explain COINS vs BCOM benchmark comparison
   - Show top holdings and performance attribution

4. **Settings Page**
   - Click "Settings" in sidebar
   - Show about information

### Adding a Trade (Optional Demo):

You can add a trade during the demo using the backend API:

```bash
# In a new terminal
curl -X POST http://127.0.0.1:5000/add-trade \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "entry_price": 150.00,
    "shares": 10,
    "position_type": "OW",
    "position_amount": 5.0
  }'
```

Then refresh the dashboard to see the new trade appear!

---

## Troubleshooting

### Backend Issues:

**Problem**: `ModuleNotFoundError` or import errors
```bash
# Solution: Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Problem**: Port 5000 already in use
```bash
# Solution: Kill the process using port 5000
# On macOS/Linux:
lsof -ti:5000 | xargs kill -9
# On Windows:
# netstat -ano | findstr :5000
# taskkill /PID <PID> /F
```

**Problem**: Data file not found
```bash
# Solution: Make sure you're running from the project root
# The backend looks for data/ directory at project root
cd /path/to/coins-pl-dashboard
cd code/backend
python app.py
```

### Frontend Issues:

**Problem**: `npm install` fails
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Port 3000 already in use
```bash
# Solution: Vite will automatically use the next available port
# Or specify a different port:
npm run dev -- --port 3001
```

**Problem**: API connection errors
```bash
# Solution: Check that backend is running
# Check browser console for CORS errors
# Make sure backend CORS is enabled (it should be)
```

**Problem**: No data showing
```bash
# Solution: Check that data/trades.json exists and has valid JSON
# Check browser Network tab to see if API calls are successful
# Check backend terminal for error messages
```

---

## Quick Start Scripts

### macOS/Linux - Start Both Servers:

Create a file `start_demo.sh`:

```bash
#!/bin/bash

# Start backend in background
cd code/backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend running on http://127.0.0.1:5000 (PID: $BACKEND_PID)"
echo "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait
```

Make it executable and run:
```bash
chmod +x start_demo.sh
./start_demo.sh
```

### Windows - Start Both Servers:

Create a file `start_demo.bat`:

```batch
@echo off
start "Backend" cmd /k "cd code\backend && venv\Scripts\activate && python app.py"
timeout /t 3
start "Frontend" cmd /k "cd code\frontend && npm run dev"
echo Backend: http://127.0.0.1:5000
echo Frontend: http://localhost:3000
pause
```

Run: `start_demo.bat`

---

## Demo Tips

1. **Have sample data ready**: Make sure `data/trades.json` has at least 2-3 trades with different tickers
2. **Check internet connection**: Backend needs internet to fetch live prices from Yahoo Finance
3. **Show the code**: Be ready to show key files like `app.py` and `App.tsx` if asked
4. **Explain the architecture**: Frontend (React) ↔ Backend (Flask) ↔ Yahoo Finance API
5. **Highlight features**: Real-time updates, P/L calculations, portfolio analytics

---

## Stopping the Demo

1. **Stop Frontend**: Press `Ctrl+C` in Terminal 2
2. **Stop Backend**: Press `Ctrl+C` in Terminal 1

Or use the quick start script which handles both.

---

## Production Demo (If Deployed)

Simply open your Vercel deployment URL - everything is already running!

No setup needed, just share the link.

