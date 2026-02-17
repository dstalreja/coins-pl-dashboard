export interface Trade {
  id: string;
  ticker: string;
  entryPrice: number;
  livePrice: number;
  shares: number;
  positionType?: "OW" | "UW";
  positionAmount?: number; // always a percent
  unrealizedPL: number;
  unrealizedPLPct: number;
  closed?: boolean;
}

export interface ApiPLRow {
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

export interface ClosedTrade {
  id: string;
  ticker: string;
  entryPrice: number;
  closePrice: number;
  shares: number;
  weight: number;
  positionType?: string;
  closeDate: string;
  closeTime: string;
}
