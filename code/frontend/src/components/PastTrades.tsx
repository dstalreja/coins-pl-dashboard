import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import coinsLogo from "figma:asset/51a8b3c7d66d29fa88ccdc6ef32082b1f2273696.png";
import { ClosedTrade } from "../types";
import { PageTitle } from "./PageTitle";

interface PastTradesProps {
  closedTrades: ClosedTrade[];
}

export function PastTrades({ closedTrades }: PastTradesProps) {

  // ✅ Group by closeDate properly
  const groupedTrades = closedTrades.reduce((groups, trade) => {
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <img
            src={coinsLogo}
            alt="COINS Logo"
            className="w-16 h-16 rounded-full object-cover relative z-10 border-2 border-primary/20"
          />
        </div>
        <div>
          <PageTitle title="Past Trades" />
          <p className="text-muted-foreground mt-1">Historical performance and closed positions</p>
        </div>
      </div>

      {closedTrades.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl">📉</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground">No closed trades yet</h3>
          <p className="text-muted-foreground max-w-sm mt-2">Trades will appear here once they are closed in the backend.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="relative">
              <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 mb-4 border-b border-white/10">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary/50" />
                  {dateKey}
                </h2>
              </div>

              {/* Trades Table for this date */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-sm relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                      <TableHead className="py-4 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Ticker</TableHead>
                      <TableHead className="py-4 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Entry Price</TableHead>
                      <TableHead className="py-4 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Close Price</TableHead>
                      <TableHead className="py-4 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Position</TableHead>
                      <TableHead className="py-4 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Shares</TableHead>
                      <TableHead className="py-4 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Realized P/L ($)</TableHead>
                      <TableHead className="py-4 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Realized P/L (%)</TableHead>
                      <TableHead className="py-4 px-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Close Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedTrades[dateKey].map((trade) => {
                      const { plDollar, plPercent } = calculateRealizedPL(trade);
                      const isPositive = plDollar >= 0;

                      return (
                        <TableRow key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <TableCell className="py-4 px-8">
                            <span className="inline-flex items-center">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary mr-3 text-sm font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)] border border-primary/20 group-hover:scale-110 transition-transform">
                                {trade.ticker.charAt(0)}
                              </span>
                              <span className="text-foreground font-semibold tracking-tight">{trade.ticker}</span>
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-8 text-muted-foreground font-mono text-sm">
                            ${trade.entryPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-4 px-8 text-foreground font-mono text-sm font-medium">
                            ${trade.closePrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-4 px-8 text-muted-foreground text-xs uppercase tracking-wide">
                            {trade.weight}% {trade.positionType ?? ""}
                          </TableCell>
                          <TableCell className="py-4 px-8 text-muted-foreground font-mono text-sm">
                            {trade.shares}
                          </TableCell>
                          <TableCell className="py-4 px-8">
                            <span className={`font-mono font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                              {isPositive ? "+" : ""}${plDollar.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-8">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isPositive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                }`}
                            >
                              {isPositive ? "+" : ""}
                              {plPercent.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-8 text-muted-foreground text-sm">
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
