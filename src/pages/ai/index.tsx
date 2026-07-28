import React, { useEffect, useState } from "react";

// Deriv API endpoint (Your App ID)
const DERIV_API = 'wss://frontend.binaryws.com/websockets/v3?app_id=96820';

const AI: React.FC = () => {
  const [price, setPrice] = useState<string>("--");
  const [digits, setDigits] = useState<number[]>(Array(10).fill(0));
  const [evenPct, setEvenPct] = useState<string>("0");
  const [oddPct, setOddPct] = useState<string>("0");
  const [risePct, setRisePct] = useState<string>("0");
  const [fallPct, setFallPct] = useState<string>("0");

  useEffect(() => {
    let ws = new window.WebSocket(DERIV_API);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        ticks_history: "R_10",
        adjust_start_time: 1,
        count: 120,
        end: "latest",
        style: "ticks"
      }));
    };
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.msg_type === "history") {
        const prices = data.history.prices || [];
        if (prices.length) setPrice(prices[prices.length-1].toString());
        let dist = Array(10).fill(0);
        let even=0, odd=0, rise=0, fall=0;
        for (let i = 1; i < prices.length; ++i) {
          const d = Number(String(prices[i]).slice(-1));
          dist[d]++;
          if (d % 2 === 0) even++; else odd++;
          if (prices[i] > prices[i-1]) rise++; else if (prices[i] < prices[i-1]) fall++;
        }
        setDigits(dist);
        setEvenPct(((even/(even+odd))*100).toFixed(2));
        setOddPct(((odd/(even+odd))*100).toFixed(2));
        setRisePct(((rise/(rise+fall))*100).toFixed(2));
        setFallPct(((fall/(rise+fall))*100).toFixed(2));
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <div style={{ fontSize: 36, fontWeight: "bold", color: "#ff3344", letterSpacing: 1, marginBottom: 12 }}>
        {price}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 }}>
        {digits.map((v, idx) => (
          <div
            key={idx}
            style={{
              minWidth: 45,
              minHeight: 45,
              borderRadius: 8,
              background: idx === 2 ? "#ff3344" : "#fff",
              color: idx === 2 ? "#fff" : "#232c41",
              border: idx === 2 ? "2.5px solid #ff3344" : "2px solid #232c41",
              fontWeight: 800,
              fontSize: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {idx}
            <span style={{ fontSize: 11, color: idx === 2 ? "#fff" : "#888", fontWeight: 400 }}>
              {v}
            </span>
          </div>
        ))}
      </div>
      {/* Odd/Even line */}
      <div style={{
        display: "flex", gap: 2, flexWrap: "wrap", margin: "0 auto 16px", justifyContent: "center"
      }}>
        <span
          style={{
            background: "#baffc0",
            color: "#232c41",
            borderRadius: 4,
            padding: "2px 6px",
            margin: 1,
            fontWeight: 600,
            fontSize: 13
          }}
        >
          Even: {evenPct}%
        </span>
        <span
          style={{
            background: "#ffb3c0",
            color: "#232c41",
            borderRadius: 4,
            padding: "2px 6px",
            margin: 1,
            fontWeight: 600,
            fontSize: 13
          }}
        >
          Odd: {oddPct}%
        </span>
      </div>
      {/* Rise/Fall */}
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{
          background: "#baffc0",
          height: 28,
          borderRadius: 6,
          margin: "8px 0"
        }}>
          <div style={{
            width: `${risePct}%`,
            background: "#22bb44",
            height: "100%",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            color: "#fff",
            fontWeight: 700,
            paddingLeft: 12
          }}>
            Rise: {risePct}%
          </div>
        </div>
        <div style={{
          background: "#ffb3c0",
          height: 28,
          borderRadius: 6,
          margin: "8px 0"
        }}>
          <div style={{
            width: `${fallPct}%`,
            background: "#ff3344",
            height: "100%",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            color: "#fff",
            fontWeight: 700,
            paddingLeft: 12
          }}>
            Fall: {fallPct}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;