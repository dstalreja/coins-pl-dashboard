# 🪙 COINS Live P/L Dashboard

An educational trading dashboard for the **Virginia Tech COINS (Commodity Investing by Students)** club, providing live and historical profit/loss tracking via a Flask backend and React (Vite) frontend.

---

## ✨ Features

- 📈 **Live market price P/L calculations** using Yahoo Finance (yfinance)
- 🔁 **Auto-refreshing UI** for live and past trades
- ✅ **Close a trade → moves it to history**
- 🗑 **Delete trade support**
- 🚀 **Deployment to Vercel + Render supported**
- 📊 **Short/long direction via Overweight (OW) and Underweight (UW)**

---

## 📁 Project Structure

coins-pl-dashboard/
│── backend/
│ └── app.py
│ └── trades.json
│ └── closed-trades.json
│── frontend/
│ └── src/
│ └── dist/ # generated after build
│── README.md


---

## ▶️ Run Locally (Self-Host the Dashboard)

### 1. Clone the repository

git clone <repo-url>
cd coins-pl-dashboard

### 2. Start the Flask backend (port 5000)

cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors yfinance
flask run --port 5000

Backend will run on:
http://127.0.0.1:5000

### 3. Start the React (Vite) frontend
cd ../frontend
npm install
npm run dev

Frontend will start on:
http://localhost:5173

### 4. Local API Configuration (if hosting both yourself):

Create a .env file inside the frontend folder:
VITE_API_BASE_URL=http://127.0.0.1:5000/api
