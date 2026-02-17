import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Trade, ApiPLRow } from "../types";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

interface TradeTableProps {
  trades: Trade[];
  errors: ApiPLRow[];
  refreshTrades: () => void;
  onDelete?: (id: string) => Promise<void>;
  isAllowed?: boolean;
}

export function TradeTable({ trades, errors, refreshTrades, onDelete, isAllowed }: TradeTableProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl relative z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10 hover:bg-transparent">
            <TableHead className="py-6 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Ticker</TableHead>
            <TableHead className="py-6 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Entry Price</TableHead>
            <TableHead className="py-6 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Live Price</TableHead>
            <TableHead className="py-6 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Position</TableHead>
            <TableHead className="py-6 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Shares</TableHead>
            <TableHead className="py-6 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Unrealized P/L ($)</TableHead>
            <TableHead className="py-6 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Unrealized P/L (%)</TableHead>
            {isAllowed && (
              <TableHead className="py-6 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Any error rows from the API */}
          {errors.map((row, idx) => (
            <TableRow
              key={`error-${row.ticker}-${idx}`}
              className="border-b border-white/5 text-destructive font-medium bg-destructive/5"
            >
              <TableCell className="py-4 px-8">{row.ticker}</TableCell>
              <TableCell className="py-4 px-8" colSpan={isAllowed ? 7 : 6}>
                Error: {row.error}
              </TableCell>
            </TableRow>
          ))}

          {/* Normal trade rows */}
          {trades.map((trade) => {
            const isPositive = trade.unrealizedPL >= 0;

            // Build "% OW / UW" display and color
            let positionText = "—";
            let positionClass = "text-muted-foreground";
            if (
              trade.positionType &&
              trade.positionAmount !== undefined &&
              trade.positionAmount !== null
            ) {
              positionText = `${trade.positionAmount}% ${trade.positionType}`;
              positionClass =
                trade.positionType === "OW" ? "text-emerald-400 font-medium" : "text-rose-400 font-medium";
            }

            const plDollarText = `${isPositive ? "+" : ""}$${trade.unrealizedPL.toFixed(
              2
            )}`;
            const plPercentText = `${isPositive ? "+" : ""}${trade.unrealizedPLPct.toFixed(
              2
            )}%`;

            return (
              <TableRow key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                {/* Ticker with circular badge */}
                <TableCell className="py-4 px-8">
                  <span className="inline-flex items-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary mr-3 text-sm font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)] border border-primary/20 group-hover:scale-110 transition-transform">
                      {trade.ticker.charAt(0)}
                    </span>
                    <span className="text-foreground font-semibold tracking-tight">
                      {trade.ticker}
                    </span>
                  </span>
                </TableCell>

                {/* Entry Price */}
                <TableCell className="py-4 px-8 text-muted-foreground font-mono text-sm">
                  ${trade.entryPrice.toFixed(2)}
                </TableCell>

                {/* Live Price with amber dot + pulse */}
                <TableCell className="py-4 px-8">
                  <span className="inline-flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-foreground font-mono text-sm font-medium">
                      ${trade.livePrice.toFixed(2)}
                    </span>
                  </span>
                </TableCell>

                {/* % OW / UW */}
                <TableCell className="py-4 px-8">
                  <span className={`${positionClass} text-xs uppercase tracking-wide`}>{positionText}</span>
                </TableCell>

                {/* Shares */}
                <TableCell className="py-4 px-8 text-muted-foreground font-mono text-sm">
                  {trade.shares}
                </TableCell>

                {/* Unrealized P/L ($) */}
                <TableCell className="py-4 px-8">
                  <span className={`font-mono font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {plDollarText}
                  </span>
                </TableCell>

                {/* Unrealized P/L (%) as colored pill */}
                <TableCell className="py-4 px-8">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isPositive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                  >
                    {plPercentText}
                  </span>
                </TableCell>

                {/* Actions */}
                {isAllowed && (
                  <TableCell className="py-4 px-8 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Trade?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the trade for <span className="font-semibold text-foreground">{trade.ticker}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onDelete?.(trade.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

