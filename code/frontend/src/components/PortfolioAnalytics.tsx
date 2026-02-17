// 2nd iteration
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import coinsLogo from "figma:asset/51a8b3c7d66d29fa88ccdc6ef32082b1f2273696.png";

import { Trade } from "../types";

interface PortfolioAnalyticsProps {
  trades: Trade[];
}

const holdingColors = ["#D97706", "#991B1B", "#92400E"];

export function PortfolioAnalytics({ trades }: PortfolioAnalyticsProps) {
  console.log("PortfolioAnalytics mounted ✅");

  const [chartData, setChartData] = useState<any[]>([]);
  const [holdingsForChart, setHoldingsForChart] = useState<any[]>([]);
  const [divisionPerformance, setDivisionPerformance] = useState<Record<string, any>>({});
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [benchmark, setBenchmark] = useState(0);
  const [spread, setSpread] = useState(0);

  // ✅ Load synthetic Excel at runtime using SheetJS
  useEffect(() => {
    const filePath = "/portfolio_placeholder.xlsx"; // This is your synthetic file we created earlier

    fetch(filePath)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets["PortfolioData"];
        const jsonData = XLSX.utils.sheet_to_json(ws);

        setChartData(jsonData);

        const latest: any = jsonData[jsonData.length - 1] || { COINS: 0, BCOM: 0, spread: 0 };

        setPortfolioValue(latest.COINS);
        setBenchmark(latest.BCOM);
        setSpread(latest.spread);

        // ✅ Generate synthetic top holdings for Bar Chart
        const mockTopHoldings = [
          { ticker: "USO", value: 62000, percentage: 45.9 },
          { ticker: "SLV", value: 46500, percentage: 34.4 },
          { ticker: "BNO", value: 26500, percentage: 19.7 },
        ];

        setHoldingsForChart(mockTopHoldings);

        const reordered =
          mockTopHoldings.length >= 3
            ? [mockTopHoldings[1], mockTopHoldings[0], mockTopHoldings[2]]
            : mockTopHoldings;

        setHoldingsForChart(reordered);

        // ✅ Generate synthetic division performance table values
        setDivisionPerformance({
          Energy: { benchmarkPerf: -2.34, relativePerf: 1.28, absoluteGainLoss: 8450 },
          Agriculture: { benchmarkPerf: 3.67, relativePerf: -0.92, absoluteGainLoss: -3200 },
          Metals: { benchmarkPerf: 5.12, relativePerf: 2.45, absoluteGainLoss: 12380 },
        });
      })
      .catch((err) => console.error("Error loading Excel file:", err));
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
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
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">Portfolio Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into performance metrics and attribution</p>
        </div>

      </div>

      {/* PERFORMANCE CHART */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        <div className="flex gap-8 mb-6 relative z-10">
          <div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">COINS Portfolio</span>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(portfolioValue)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">BCOM Benchmark</span>
            <p className="text-2xl font-bold text-muted-foreground">{formatCurrency(benchmark)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} tickFormatter={(v) => `$${v / 1000}K`} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(3, 2, 19, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              formatter={(v: number) => formatCurrency(v)}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey="COINS" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} />
            <Line type="monotone" dataKey="BCOM" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* DIVIDED ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* SPREAD GRAPH */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 relative overflow-hidden">
          <h2 className="text-lg font-semibold mb-1 text-foreground">COINS - BCOM Spread</h2>
          <p className="text-3xl font-bold mb-6 text-emerald-400">{formatCurrency(spread)}</p>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} tickFormatter={(v) => `$${v / 1000}K`} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(3, 2, 19, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Line type="monotone" dataKey="spread" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TOP HOLDINGS CHART */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 relative overflow-hidden">
          <h2 className="text-lg font-semibold mb-6 text-foreground">Top Holdings</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={holdingsForChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="ticker" type="category" stroke="rgba(255,255,255,0.8)" width={50} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(3, 2, 19, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                {holdingsForChart.map((_e, i) => (
                  <Cell key={i} fill={["#3b82f6", "#8b5cf6", "#10b981"][i % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PERFORMANCE TABLE */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 relative overflow-hidden">
        <h2 className="text-xl font-semibold mb-6 text-foreground">Performance Attribution</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Division</th>
                <th className="text-right py-4 px-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Benchmark Absolute Performance</th>
                <th className="text-right py-4 px-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Relative Performance</th>
                <th className="text-right py-4 px-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Absolute Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(divisionPerformance).map(([division, perf]) => (
                <tr key={division} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-medium text-foreground">{division}</td>

                  {/* Styled cells (preserved colors + rounding + padding) */}
                  <td className="text-right py-4 px-4">
                    <span className={`px-2 py-1 rounded-md text-sm font-medium ${perf.benchmarkPerf < 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                      {formatPercentage(perf.benchmarkPerf)}
                    </span>
                  </td>

                  <td className="text-right py-4 px-4">
                    <span className={`px-2 py-1 rounded-md text-sm font-medium ${perf.relativePerf < 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                      {formatPercentage(perf.relativePerf)}
                    </span>
                  </td>

                  <td className="text-right py-4 px-4">
                    <span className={`font-mono ${perf.absoluteGainLoss < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {formatCurrency(perf.absoluteGainLoss)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}