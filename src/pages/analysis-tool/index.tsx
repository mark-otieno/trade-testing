import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

// Deriv API endpoint (Your App ID)
const DERIV_API = 'wss://frontend.binaryws.com/websockets/v3?app_id=96820';

const volatilityList = [
  { symbol: "R_10", label: "VOLATILITY INDEX 10" },
  { symbol: "R_25", label: "VOLATILITY INDEX 25" },
  { symbol: "R_50", label: "VOLATILITY INDEX 50" },
  { symbol: "R_75", label: "VOLATILITY INDEX 75" },
  { symbol: "R_100", label: "VOLATILITY INDEX 100" }
];

export default function AnalysisTool() {
  const [volIndex, setVolIndex] = useState(volatilityList[0].symbol);
  const [digits, setDigits] = useState(60);
  const [lastPrice, setLastPrice] = useState(null);
  const [digitStats, setDigitStats] = useState({ even: 0, odd: 0, dist: [] });

  useEffect(() => {
    let ws = new WebSocket(DERIV_API);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        ticks_history: volIndex,
        adjust_start_time: 1,
        count: digits,
        end: "latest",
        style: "ticks"
      }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.msg_type === "history") {
        const prices = data.history.prices || [];
        setLastPrice(prices[prices.length - 1]);
        // Digit stats
        let even = 0, odd = 0, dist = Array(10).fill(0);
        prices.forEach((p) => {
          const d = Number(String(p).slice(-1));
          dist[d]++;
          if (d % 2 === 0) even++; else odd++;
        });
        setDigitStats({
          even: ((even / prices.length) * 100).toFixed(2),
          odd: ((odd / prices.length) * 100).toFixed(2),
          dist: dist.map((v, i) => ({ digit: i, value: v }))
        });
      }
    };

    return () => ws.close();
  }, [volIndex, digits]);

  return (
    <div style={{ display: "flex", minHeight: "80vh", background: "#f5f7fa" }}>
      {/* Sidebar */}
      <div
        style={{
          background: "linear-gradient(180deg, #14233a 60%, #2b4a6b 100%)",
          color: "#fff",
          minWidth: 260,
          padding: "32px 18px 15px 18px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start"
        }}
      >
        <h2 style={{ fontWeight: "bold", fontSize: 32, letterSpacing: 1, color: "#fff" }}>
          ANALYSIS
        </h2>
        <div style={{ fontSize: 15, marginBottom: 32, opacity: 0.85 }}>
          Trading Pattern Recognition
        </div>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontWeight: "bold", fontSize: 15 }}>Volatility Index</div>
          <select
            value={volIndex}
            onChange={e => setVolIndex(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 8,
              borderRadius: 4,
              border: "none",
              background: "#223a5a",
              color: "#fff",
              fontSize: 15
            }}
          >
            {volatilityList.map(v => (
              <option value={v.symbol} key={v.symbol}>{v.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontWeight: "bold", fontSize: 15 }}>Number of Digits</div>
          <input
            type="number"
            value={digits}
            min={10}
            max={500}
            onChange={e => setDigits(Number(e.target.value))}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 8,
              borderRadius: 4,
              border: "none",
              background: "#223a5a",
              color: "#fff",
              fontSize: 15
            }}
          />
        </div>
        <div style={{ margin: "32px 0 0 0", fontWeight: 600, fontSize: 16 }}>
          <div style={{ marginBottom: 9, opacity: 0.85 }}>Even/odd</div>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                background: "#232c41",
                color: "#fff",
                borderRadius: 7,
                padding: "8px 14px",
                fontWeight: "bold",
                fontSize: 15,
                border: "2px solid #22bbff"
              }}
            >
              Even: {digitStats.even}%
            </div>
            <div
              style={{
                background: "#232c41",
                color: "#fff",
                borderRadius: 7,
                padding: "8px 14px",
                fontWeight: "bold",
                fontSize: 15,
                border: "2px solid #ff3344"
              }}
            >
              Odd: {digitStats.odd}%
            </div>
          </div>
        </div>
      </div>

      {/* Main analysis content */}
      <div style={{ flex: 1, padding: "32px 28px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            padding: 32,
            marginBottom: 32
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#2b2b2b",
              letterSpacing: 1,
              marginBottom: 8
            }}
          >
            CURRENT PRICE
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#ff3344",
              letterSpacing: 1
            }}
          >
            Latest Price: {lastPrice ?? "--"}
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            padding: 32
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#2b2b2b",
              letterSpacing: 1,
              marginBottom: 18
            }}
          >
            Digit Distribution
          </div>
          {/* Professional bar chart */}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={digitStats.dist}>
              <XAxis dataKey="digit" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ff3344">
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}