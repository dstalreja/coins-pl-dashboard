# COINS Live Trading Dashboard

## Project Overview and Purpose

The COINS Live Trading Dashboard is a real-time web application designed to monitor and track trading positions for the COINS (Commodity Investment) club. The dashboard provides live profit/loss calculations, portfolio analytics, and trade history management for commodity ETF positions.

### Key Features:
- **Live Trade Monitoring**: Real-time tracking of open positions with automatic price updates every 15 seconds
- **P/L Calculations**: Automatic calculation of unrealized profit/loss for both Overweight (OW) and Underweight (UW) positions
- **Portfolio Analytics**: Visual charts and performance metrics comparing COINS portfolio against BCOM benchmark
- **Trade History**: Complete record of closed trades with realized P/L calculations
- **Modern UI**: Responsive React-based interface with dark mode support

The application consists of a React frontend (deployed on Vercel) and a Flask backend API (deployed on Render) that fetches live stock prices from Yahoo Finance.

## Video Link

[Add your project demonstration video link here]

## Installation and Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher) and npm
- **Python** (3.9 or higher) and pip
- **Git** for version control

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd code/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Ensure data files exist in the `data/` directory:
   - `trades.json` - Contains open trade positions
   - `closed-trades.json` - Contains closed trade history
   - `portfolio_placeholder.xlsx` - Portfolio analytics data

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd code/frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (for local development):
   ```bash
   echo "VITE_API_BASE_URL=http://127.0.0.1:5000" > .env.local
   ```

   For production (Vercel), set the environment variable:
   - Variable name: `VITE_API_BASE_URL`
   - Variable value: `https://coins-pl-dashboard.onrender.com`

## How to Run the Program and Reproduce Results

### Running Locally

1. **Start the Backend Server**:
   ```bash
   cd code/backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python app.py
   ```
   The backend will start on `http://127.0.0.1:5000`

2. **Start the Frontend Development Server**:
   ```bash
   cd code/frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:3000` (or another port if 3000 is occupied)

3. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`

### Production Deployment

- **Backend**: Deployed on Render at `https://coins-pl-dashboard.onrender.com`
- **Frontend**: Deployed on Vercel (set `VITE_API_BASE_URL` environment variable to the Render URL)

### Reproducing Results

1. **View Live Trades**: Navigate to the Dashboard page to see all open positions with real-time P/L calculations
2. **View Past Trades**: Click on "Past Trades" in the sidebar to see closed positions grouped by date
3. **View Analytics**: Click on "Portfolio Analytics" to see performance charts and metrics
4. **Add a Trade**: Use the backend API endpoint `/add-trade` or the HTML form at `/add-trade` to add new positions

### Testing the Application

1. **Add a Test Trade**:
   ```bash
   curl -X POST http://127.0.0.1:5000/add-trade \
     -H "Content-Type: application/json" \
     -d '{
       "ticker": "SLV",
       "entry_price": 25.50,
       "shares": 100,
       "position_type": "OW",
       "position_amount": 5.0
     }'
   ```

2. **View the Trade**: Refresh the dashboard to see the new trade with live price updates

3. **Close a Trade**: Use the `closeTrade.ts` script or API endpoint:
   ```bash
   curl -X POST http://127.0.0.1:5000/api/close-trade \
     -H "Content-Type: application/json" \
     -d '{"ticker": "SLV"}'
   ```

## Technologies or Libraries Used

### Backend
- **Flask** (v2.x) - Python web framework for API endpoints
- **Flask-CORS** - Cross-Origin Resource Sharing support
- **yfinance** - Yahoo Finance API wrapper for real-time stock prices
- **pandas** - Data manipulation for financial data
- **Python 3.9+** - Programming language

### Frontend
- **React 18.3** - JavaScript UI library
- **TypeScript** - Type-safe JavaScript
- **Vite 6.3** - Build tool and development server
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives (shadcn/ui)
- **Recharts 2.15** - Charting library for data visualization
- **XLSX (SheetJS)** - Excel file reading for portfolio data
- **Lucide React** - Icon library

### Deployment
- **Vercel** - Frontend hosting platform
- **Render** - Backend hosting platform
- **Git** - Version control

## Project Structure

```
coins-pl-dashboard/
├── code/                    # All source code files
│   ├── backend/            # Flask backend application
│   │   ├── app.py         # Main Flask application
│   │   ├── requirements.txt
│   │   └── templates/     # HTML templates
│   └── frontend/          # React frontend application
│       ├── src/           # Source files
│       │   ├── components/  # React components
│       │   ├── config.ts    # API configuration
│       │   └── ...
│       ├── package.json
│       └── vite.config.ts
├── data/                   # Data files and configuration
│   ├── trades.json        # Open trade positions
│   ├── closed-trades.json # Closed trade history
│   └── portfolio_placeholder.xlsx  # Portfolio analytics data
├── tests/                  # Test scripts and verification files
├── docs/                   # Supporting materials (screenshots, documentation)
├── report/                 # Final report document
└── README.md              # This file
```

## Author(s) and Contribution Summary

**Author**: [Your Name]

### Contribution Summary:
- **Backend Development**: Designed and implemented Flask API with real-time price fetching, P/L calculations, and trade management endpoints
- **Frontend Development**: Built React dashboard with TypeScript, including live trade monitoring, portfolio analytics, and trade history views
- **UI/UX Design**: Created modern, responsive interface using Tailwind CSS and Radix UI components
- **Deployment**: Configured and deployed application on Vercel (frontend) and Render (backend)
- **Data Management**: Implemented JSON-based data persistence for trades and portfolio analytics

## Additional Notes

- The application uses Yahoo Finance (yfinance) for real-time stock prices, which may have a ~15 minute delay
- This is an educational tool for internal club use only and does not constitute trading or investment advice
- CORS is enabled on the backend to allow cross-origin requests from the frontend
- The application supports both Overweight (OW) and Underweight (UW) position types with appropriate P/L calculations

## License

[Specify your license here, if applicable]
