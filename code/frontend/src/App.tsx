import { Sidebar } from "./components/Sidebar";
import { TradeTable } from "./components/TradeTable";
import { SettingsPage } from "./components/SettingsPage";
import { PortfolioAnalytics } from "./components/PortfolioAnalytics";
import { PastTrades } from "./components/PastTrades";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";

import { useState, useEffect } from "react";
import { ModeToggle } from "./components/mode-toggle";
import "./styles/globals.css";
import { API_BASE_URL } from "./config";

import { Trade, ApiPLRow, ClosedTrade } from "./types";
import { useAuth } from "./components/AuthProvider";
import { GoogleLogin } from "@react-oauth/google";
import { AddTradeDialog } from "./components/AddTradeDialog";
import { Loader2, LogOut } from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [errors, setErrors] = useState<ApiPLRow[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);

  const { user, login, logout, isAllowed, token } = useAuth();

  const refreshClosedTrades = () => {
    fetch(`${API_BASE_URL}/api/closed`)
      .then(res => res.json())
      .then((data) => {
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

      const goodRows = data.filter((row) => !row.error);
      const errorRows = data.filter((row) => row.error);

      const mapped: Trade[] = goodRows.map((row, idx) => ({
        id: row.id || `${row.ticker}-${idx}`, // Backend should send ID now or fallback
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

  const handleDeleteTrade = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trades/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete trade");
      }

      refreshTrades();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete trade");
    }
  };

  useEffect(() => {
    refreshTrades();
    refreshClosedTrades();

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
        <div className="flex justify-end items-center gap-4 mb-8">
          {!user ? (
            <div className="relative overflow-hidden rounded-full">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  if (credentialResponse.credential) {
                    login(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
                theme="filled_black"
                shape="pill"
                text="signin_with"
                size="medium"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-secondary/50 backdrop-blur-sm border border-white/10 rounded-full px-1 pr-1 py-1 pl-4">
              <span className="text-sm font-medium hidden sm:inline-block truncate max-w-[150px]">
                {user.name || user.email}
              </span>
              {user.picture ? (
                <img src={user.picture} alt="User" className="h-8 w-8 rounded-full border border-white/20" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-white/20">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/20 hover:text-destructive" onClick={logout} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          <ModeToggle />
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

                {/* Add Trade Button (Only for Admins) */}
                {isAllowed && (
                  <AddTradeDialog onTradeAdded={refreshTrades} />
                )}
              </div>

              <TradeTable
                trades={trades}
                errors={errors}
                refreshTrades={refreshTrades}
                onDelete={handleDeleteTrade}
                isAllowed={isAllowed}
              />
            </>
          )}

          {currentPage === "settings" && <SettingsPage />}

          {currentPage === "analytics" && (
            <PortfolioAnalytics trades={trades} />
          )}

          {currentPage === "past-trades" && (
            <PastTrades closedTrades={closedTrades} />
          )}

        </div>
      </main>
    </div>
  );
}
