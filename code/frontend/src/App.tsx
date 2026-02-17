import { Sidebar } from "./components/Sidebar";
import { TradeTable } from "./components/TradeTable";
import { SettingsPage } from "./components/SettingsPage";
import { PortfolioAnalytics } from "./components/PortfolioAnalytics";
import { PastTrades } from "./components/PastTrades";
import { Card } from "./ui/card";


import coinsLogo from "figma:asset/51a8b3c7d66d29fa88ccdc6ef32082b1f2273696.png";
import { useState, useEffect } from "react";
import { ModeToggle } from "./components/mode-toggle";
import "./styles/globals.css";
import { API_BASE_URL } from "./config";

import { Trade, ApiPLRow, ClosedTrade } from "./types";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [errors, setErrors] = useState<ApiPLRow[]>([]); // ✅ Handle errors
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);

  const refreshClosedTrades = () => {
    fetch(`${API_BASE_URL}/api/closed`)
      .then(res => res.json())
      .then((data) => {
        // ✅ Convert backend data keys into interface shape
        const mapped: ClosedTrade[] = data.map((t: any) => ({
          id: t.id ?? crypto.randomUUID(),
          ticker: t.ticker,
          entryPrice: t.entry_price ?? t.entryPrice,
          closePrice: t.close_price ?? t.closePrice,
          shares: t.shares,
          weight: t.position_amount ?? t.weight ?? 0,
          positionType: t.position_type,
          closeDate: t.close_date ?? t.closeDate,
          closeTime: (t.close_date ?? t.closeDate)
            ? new Date(t.close_date ?? t.closeDate).toLocaleTimeString()
            : ""
        }));
        setClosedTrades(mapped);
      })
      .catch(err => console.error("Error loading closed trades:", err));
  };

  const refreshTrades = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pl`);
      const data: ApiPLRow[] = await res.json();

      // Separate out any error rows (bad tickers, etc.)
      const goodRows = data.filter((row) => !row.error);
      const errorRows = data.filter((row) => row.error);

      const mapped: Trade[] = goodRows.map((row, idx) => ({
        id: `${row.ticker}-${idx}`,
        ticker: row.ticker,
        entryPrice: row.entry_price ?? 0,
        livePrice: row.live_price ?? row.entry_price ?? 0,
        shares: row.shares ?? 0,
        positionType: row.position_type,
        positionAmount: row.position_amount,
        unrealizedPL: row.unrealized_pl ?? 0,
        unrealizedPLPct: row.unrealized_pl_pct ?? 0,
      }));

      setTrades(mapped);
      setErrors(errorRows);
    } catch (err) {
      console.error("Error loading trades:", err);
    }
  };

  useEffect(() => {
    refreshTrades();
    refreshClosedTrades();

    // Auto-refresh every 15s
    const interval = setInterval(refreshTrades, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute bottom-[0%] left-[20%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 overflow-auto relative z-10 p-8">
        {/* Persistent Top-Right Actions */}
        <div className="absolute top-8 right-8 flex items-center gap-4 z-50">
          <ModeToggle />
          <div className="h-10 w-10 rounded-full bg-secondary/50 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <span className="text-sm font-medium">JD</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">

          {currentPage === "dashboard" && (
            <>
              {/* Header Area */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Live trading overview and portfolio metrics
                  </p>
                </div>
              </div>

              <TradeTable trades={trades} errors={errors} refreshTrades={refreshTrades} />
            </>
          )}
        </div>

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
