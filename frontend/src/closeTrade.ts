import fetch from "node-fetch"; // or native fetch in Node 18+
import { API_BASE_URL } from "./config";

async function closeTrade(ticker: string, closePrice?: number) {
  const body: any = { ticker };

  // If you pass a manual close price, include it
  if (closePrice !== undefined) {
    body.close_price = closePrice;
  }

  const res = await fetch(`${API_BASE_URL}/api/close-trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("Closed trade response:", data);
}

// ✅ Call it here
closeTrade("SLV");                     // auto live close
// closeTrade("USO", 32.55);           // manual close example
