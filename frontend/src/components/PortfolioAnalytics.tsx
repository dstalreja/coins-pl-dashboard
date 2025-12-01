// 2nd iteration
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import coinsLogo from "figma:asset/51a8b3c7d66d29fa88ccdc6ef32082b1f2273696.png";

interface Trade {
  id: string;
  ticker: string;
  entryPrice: number;
  livePrice: number;
  shares: number;
  position_type: string;
  position_amount: number;
  unrealized_pl?: number;
  unrealized_pl_pct?: number;
}

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
    <div className="p-12">

      {/* HEADER (unchanged UI) */}
      <div className="flex items-center gap-4 mb-12">
        <img
          src={coinsLogo}
          alt="COINS Logo"
          className="w-16 h-16 rounded-full object-cover"
        />
        <h1 className="text-4xl">Portfolio Analytics</h1>
      </div>

      {/* PERFORMANCE CHART (unchanged UI) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <div className="flex gap-8 mb-6">
          <div>
            <span className="text-sm text-gray-500">COINS Portfolio</span>
            <p className="text-xl" style={{ color: "#991B1B" }}>{formatCurrency(portfolioValue)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">BCOM Benchmark</span>
            <p className="text-xl" style={{ color: "#D97706" }}>{formatCurrency(benchmark)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} tickFormatter={(v) => `$${v/1000}K`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Line type="monotone" dataKey="COINS" stroke="#991B1B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="BCOM" stroke="#D97706" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SPREAD GRAPH (unchanged UI) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl mb-2">COINS - BCOM Spread</h2>
        <p className="text-xl" style={{ color: "#7C2D12" }}>{formatCurrency(spread)}</p>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} tickFormatter={(v) => `$${v/1000}K`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Line type="monotone" dataKey="spread" stroke="#7C2D12" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TOP HOLDINGS CHART (unchanged UI) */}
      <Card className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl mb-6">Top Holdings</h2>
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={holdingsForChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="ticker" stroke="#6B7280" style={{ fontSize: "14px" }} />
                <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} tickFormatter={(v) => `$${v/1000}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {holdingsForChart.map((_e, i) => (
                    <Cell key={i} fill={holdingColors[i % holdingColors.length]} />
                ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* PERFORMANCE TABLE (original style preserved) */}
    <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
    <h2 className="text-2xl mb-6">Performance Attribution</h2>

    <div className="overflow-x-auto">
        <table className="w-full">
        <thead>
            <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4">Division</th>
            <th className="text-right py-4 px-4">Benchmark Absolute Performance</th>
            <th className="text-right py-4 px-4">Relative Performance</th>
            <th className="text-right py-4 px-4">Absolute Gain/Loss</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(divisionPerformance).map(([division, perf]) => (
            <tr key={division} className="border-b border-gray-100">
                <td className="py-4 px-4 font-medium">{division}</td>

                {/* Styled cells (preserved colors + rounding + padding) */}
                <td
                className="text-right py-4 px-4 rounded-lg"
                style={{
                    backgroundColor: perf.benchmarkPerf < 0 ? "#FEE2E2" : "#D1FAE5",
                    color: perf.benchmarkPerf < 0 ? "#991B1B" : "#065F46",
                }}
                >
                {formatPercentage(perf.benchmarkPerf)}
                </td>

                <td
                className="text-right py-4 px-4 rounded-lg"
                style={{
                    backgroundColor: perf.relativePerf < 0 ? "#FEE2E2" : "#D1FAE5",
                    color: perf.relativePerf < 0 ? "#991B1B" : "#065F46",
                }}
                >
                {formatPercentage(perf.relativePerf)}
                </td>

                <td
                className="text-right py-4 px-4 rounded-lg"
                style={{
                    backgroundColor: perf.absoluteGainLoss < 0 ? "#FEE2E2" : "#D1FAE5",
                    color: perf.absoluteGainLoss < 0 ? "#991B1B" : "#065F46",
                }}
                >
                {formatCurrency(perf.absoluteGainLoss)}
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