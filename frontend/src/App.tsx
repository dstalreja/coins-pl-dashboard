import { Sidebar } from "./components/Sidebar";
import { TradeTable } from "./components/TradeTable";
import { SettingsPage } from "./components/SettingsPage";
import { PortfolioAnalytics } from "./components/PortfolioAnalytics";
import { PastTrades } from "./components/PastTrades";
import { Card } from "./ui/card";


import coinsLogo from "figma:asset/51a8b3c7d66d29fa88ccdc6ef32082b1f2273696.png";
import { useState, useEffect } from "react";
import "./styles/globals.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [trades, setTrades] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]); // ✅ NEW

  const refreshClosedTrades = () => { // ✅ NEW
    fetch("http://127.0.0.1:5000/api/closed")
      .then(res => res.json())
      .then(data => setClosedTrades(data))
      .catch(err => console.error("Error loading closed trades:", err));
  };

  const refreshTrades = () => {
    fetch("http://127.0.0.1:5000/api/pl")
      .then(res => res.json())
      .then(data => setTrades(data))
      .catch(err => console.error("Error loading trades:", err));
  };

  useEffect(() => {
    refreshTrades();
    refreshClosedTrades(); // ✅ load closed trades on start
  }, []);

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 ml-64">

        {currentPage === "dashboard" && (
          <div className="p-12">
            <div className="flex items-center gap-4 mb-12">
              <img src={coinsLogo} alt="COINS Logo" className="w-16 h-16 rounded-full object-cover" />
              <h1 className="text-4xl">COINS Live Trade Monitor</h1>
            </div>
            <TradeTable trades={trades.filter(t => !t.closed)} refreshTrades={refreshTrades} />
          </div>
        )}

        {currentPage === "settings" && <SettingsPage />}

        {currentPage === "analytics" && (
          <PortfolioAnalytics trades={trades} />
        )}

        {currentPage === "past-trades" && (
          <PastTrades closedTrades={closedTrades} />
        )}

      </main>
    </div>
  );
}
