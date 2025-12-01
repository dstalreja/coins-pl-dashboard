import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import coinsLogo from "figma:asset/51a8b3c7d66d29fa88ccdc6ef32082b1f2273696.png";

interface ClosedTrade {
  id: string;
  ticker: string;
  entryPrice: number;
  closePrice: number;
  shares: number;
  weight: number;
  closeDate: string;
  closeTime: string;
}

interface PastTradesProps {
  closedTrades: ClosedTrade[];
}

export function PastTrades({ closedTrades = [] }: PastTradesProps) {
  const [historyTrades, setHistoryTrades] = useState<ClosedTrade[]>([]);

  const refreshClosedTrades = () => {
    fetch("http://127.0.0.1:5000/api/closed")
      .then((res) => res.json())
      .then((data) => {
        console.log("Closed trades received:", data);
        // ✅ Convert backend data keys into interface shape
        const mapped = data.map((t: any) => ({
          id: t.id ?? crypto.randomUUID(),
          ticker: t.ticker,
          entryPrice: t.entry_price ?? t.entryPrice,
          closePrice: t.close_price ?? t.closePrice,
          shares: t.shares,
          weight: t.position_amount ?? t.weight ?? 0,
          closeDate: t.close_date ?? t.closeDate,
          closeTime: t.close_date 
            ? new Date(t.close_date).toLocaleTimeString() 
            : ""
        }));
        setHistoryTrades(mapped);
      })
      .catch((err) => console.error("Error loading closed trades:", err));
  };

  useEffect(() => {
    refreshClosedTrades();
    const interval = setInterval(refreshClosedTrades, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Group by closeDate properly
  const groupedTrades = historyTrades.reduce((groups, trade) => {
    const dateKey = new Date(trade.closeDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(trade);
    return groups;
  }, {} as Record<string, ClosedTrade[]>);

  const sortedDates = Object.keys(groupedTrades).sort(
    (a, b) =>
      new Date(groupedTrades[b][0].closeDate).getTime() -
      new Date(groupedTrades[a][0].closeDate).getTime()
  );

  const calculateRealizedPL = (trade: ClosedTrade) => {
    const plDollar = (trade.closePrice - trade.entryPrice) * trade.shares;
    const plPercent = ((trade.closePrice - trade.entryPrice) / trade.entryPrice) * 100;
    return { plDollar, plPercent };
  };

  return (
    <div className="p-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <img
          src={coinsLogo}
          alt="COINS Logo"
          className="w-16 h-16 rounded-full object-cover"
        />
        <h1 className="text-4xl">Past Trades</h1>
      </div>

      {historyTrades.length === 0 ? (
        <p className="text-gray-500">No closed trades yet...</p>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <div className="mb-4">
                <h2 className="text-2xl text-gray-900">{dateKey}</h2>
                <div className="h-0.5 bg-gradient-to-r from-amber-500 to-transparent mt-2"></div>
              </div>

              {/* Trades Table for this date */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-100">
                      <TableHead className="py-6 px-8">Ticker</TableHead>
                      <TableHead className="py-6 px-8">Entry Price</TableHead>
                      <TableHead className="py-6 px-8">Close Price</TableHead>
                      <TableHead className="py-6 px-8">Position</TableHead>
                      <TableHead className="py-6 px-8">Shares</TableHead>
                      <TableHead className="py-6 px-8">Realized P/L ($)</TableHead>
                      <TableHead className="py-6 px-8">Realized P/L (%)</TableHead>
                      <TableHead className="py-6 px-8">Close Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedTrades[dateKey].map((trade) => {
                      const { plDollar, plPercent } = calculateRealizedPL(trade);
                      const isPositive = plDollar >= 0;

                      return (
                        <TableRow key={trade.id} className="border-b border-gray-50">
                          <TableCell className="py-6 px-8">
                            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-900 mr-3">
                              {trade.ticker.charAt(0)}
                            </span>
                            <span className="text-gray-900">{trade.ticker}</span>
                          </TableCell>
                          <TableCell className="py-6 px-8 text-gray-600">
                            ${trade.entryPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-6 px-8 text-gray-900">
                            ${trade.closePrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-6 px-8">
                            {trade.weight}% {trade.position_type ?? ""}
                          </TableCell>
                          <TableCell className="py-6 px-8 text-gray-600">
                            {trade.shares}
                          </TableCell>
                          <TableCell className="py-6 px-8">
                            <span className={isPositive ? "text-green-600" : "text-red-600"}>
                              {isPositive ? "+" : ""}${plDollar.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="py-6 px-8">
                            <span
                              className={`inline-flex items-center px-4 py-2 rounded-full ${
                                isPositive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {isPositive ? "+" : ""}
                              {plPercent.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="py-6 px-8 text-gray-500">
                            {trade.closeTime}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
