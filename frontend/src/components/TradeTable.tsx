import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useEffect, useState } from "react";

// Shape of what we actually render in the table
interface Trade {
  id: string;
  ticker: string;
  entryPrice: number;
  livePrice: number;
  shares: number;
  positionType?: "OW" | "UW";
  positionAmount?: number; // always a percent
  unrealizedPL: number;
  unrealizedPLPct: number;
  closed?: boolean
}

// Shape of a single row coming back from /api/pl
interface ApiPLRow {
  ticker: string;
  entry_price?: number;
  live_price?: number;
  shares?: number;
  position_type?: "OW" | "UW";
  position_amount?: number;
  unrealized_pl?: number;
  unrealized_pl_pct?: number;
  error?: string;
}

export function TradeTable() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [errors, setErrors] = useState<ApiPLRow[]>([]);

  // Fetch from Flask backend
  useEffect(() => {
    const fetchPL = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/pl");
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
        console.error("Error loading P/L data:", err);
      }
    };

    // initial load
    fetchPL();
    // auto-refresh every 15s (same behavior as Flask dashboard)
    const interval = setInterval(fetchPL, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-100">
            <TableHead className="py-6 px-8">Ticker</TableHead>
            <TableHead className="py-6 px-8">Entry Price</TableHead>
            <TableHead className="py-6 px-8">Live Price</TableHead>
            <TableHead className="py-6 px-8">Position</TableHead>
            <TableHead className="py-6 px-8">Shares</TableHead>
            <TableHead className="py-6 px-8">Unrealized P/L ($)</TableHead>
            <TableHead className="py-6 px-8">Unrealized P/L (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Any error rows from the API */}
          {errors.map((row, idx) => (
            <TableRow
              key={`error-${row.ticker}-${idx}`}
              className="border-b border-gray-50 text-red-600 italic"
            >
              <TableCell className="py-4 px-8">{row.ticker}</TableCell>
              <TableCell className="py-4 px-8" colSpan={6}>
                Error: {row.error}
              </TableCell>
            </TableRow>
          ))}

          {/* Normal trade rows */}
          {trades.map((trade) => {
            const isPositive = trade.unrealizedPL >= 0;

            // Build "% OW / UW" display and color
            let positionText = "—";
            let positionClass = "text-gray-400";
            if (
              trade.positionType &&
              trade.positionAmount !== undefined &&
              trade.positionAmount !== null
            ) {
              positionText = `${trade.positionAmount}% ${trade.positionType}`;
              positionClass =
                trade.positionType === "OW" ? "text-green-600" : "text-red-600";
            }

            const plDollarText = `${isPositive ? "+" : ""}$${trade.unrealizedPL.toFixed(
              2
            )}`;
            const plPercentText = `${isPositive ? "+" : ""}${trade.unrealizedPLPct.toFixed(
              2
            )}%`;

            return (
              <TableRow key={trade.id} className="border-b border-gray-50">
                {/* Ticker with circular badge */}
                <TableCell className="py-6 px-8">
                  <span className="inline-flex items-center">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-900 mr-3 text-sm font-medium">
                      {trade.ticker.charAt(0)}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {trade.ticker}
                    </span>
                  </span>
                </TableCell>

                {/* Entry Price */}
                <TableCell className="py-6 px-8 text-gray-600">
                  ${trade.entryPrice.toFixed(2)}
                </TableCell>

                {/* Live Price with amber dot + pulse */}
                <TableCell className="py-6 px-8">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-gray-900">
                      ${trade.livePrice.toFixed(2)}
                    </span>
                </span>
                </TableCell>

                {/* % OW / UW */}
                <TableCell className="py-6 px-8">
                  <span className={positionClass}>{positionText}</span>
                </TableCell>

                {/* Shares */}
                <TableCell className="py-6 px-8 text-gray-600">
                  {trade.shares}
                </TableCell>

                {/* Unrealized P/L ($) */}
                <TableCell className="py-6 px-8">
                  <span className={isPositive ? "text-green-600" : "text-red-600"}>
                    {plDollarText}
                  </span>
                </TableCell>

                {/* Unrealized P/L (%) as colored pill */}
                <TableCell className="py-6 px-8">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      isPositive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {plPercentText}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

