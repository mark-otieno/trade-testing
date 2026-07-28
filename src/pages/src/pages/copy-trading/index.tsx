import React, { useState } from "react";

// Deriv API endpoint (Your App ID)
const DERIV_API_URL = "wss://frontend.binaryws.com/websockets/v3?app_id=96820";

type AccountInfo = {
  loginid: string;
  balance: number;
  currency: string;
};

type TradeTransaction = {
  transaction_id: string;
  action_type: string;
  amount: number;
  transaction_time: number;
};

const CopyTrading: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeTransaction[]>([]);
  const [profit, setProfit] = useState<string>("0");
  const [log, setLog] = useState<string[]>([]);

  // Connect to Deriv with token
  const handleConnect = () => {
    setLog([]);
    if (!token) {
      alert("Paste your Deriv API token.");
      return;
    }
    let ws = new window.WebSocket(DERIV_API_URL);
    ws.onopen = () => {
      ws.send(JSON.stringify({ authorize: token }));
    };
    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.msg_type === "authorize") {
        setConnected(true);
        setAccountInfo(data.authorize);
        setLog(l => [...l, "Connected! Fetching trade history..."]);
        ws.send(JSON.stringify({ statement: 20 }));
      }
      if (data.msg_type === "statement") {
        setTradeHistory(data.statement.transactions);
        let p = data.statement.transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        setProfit(p.toFixed(2));
        ws.close();
      }
    };
    ws.onerror = () => setLog(l => [...l, "Connection error!"]);
  };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 900, fontSize: 30, color: "#e10600" }}>
        Copy Trading (Deriv Live)
      </h2>
      <div style={{ margin: "18px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <input type="text"
               placeholder="Paste your Deriv API token"
               value={token}
               onChange={(e) => setToken(e.target.value)}
               style={{
                 padding: "10px 16px",
                 borderRadius: 6,
                 border: "2px solid #e10600",
                 fontSize: 17,
                 width: 400,
                 marginRight: 12
               }} />
        <button
          style={{
            background: connected ? "#33bb44" : "#e10600",
            color: "#fff",
            fontWeight: 700,
            fontSize: 17,
            borderRadius: 6,
            border: "none",
            padding: "10px 26px",
            cursor: "pointer"
          }}
          onClick={handleConnect}
          disabled={connected}
        >
          {connected ? "Connected" : "Connect"}
        </button>
      </div>
      {connected && accountInfo && (
        <div style={{ marginBottom: 18, color: "#232c41" }}>
          <div><b>Account:</b> {accountInfo.loginid} <b>Balance:</b> {accountInfo.balance} {accountInfo.currency}</div>
        </div>
      )}
      {connected && (
        <>
          <div style={{ marginBottom: 18 }}>
            <b>Total Profit (Last 20 Trades):</b> <span style={{ color: "#22bb44" }}>{profit}</span>
          </div>
          <h3>Trade History</h3>
          <table style={{
            borderCollapse: "collapse",
            width: "100%",
            background: "#fff",
            marginBottom: 24
          }}>
            <thead>
              <tr style={{ background: "#e10600", color: "#fff" }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Type</th>
                <th style={{ padding: 8 }}>Amount</th>
                <th style={{ padding: 8 }}>Profit</th>
                <th style={{ padding: 8 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {tradeHistory.map((t, idx) => (
                <tr key={t.transaction_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 8 }}>{t.transaction_id}</td>
                  <td style={{ padding: 8 }}>{t.action_type}</td>
                  <td style={{ padding: 8 }}>{t.amount} {accountInfo?.currency}</td>
                  <td style={{ padding: 8, color: t.amount > 0 ? "#22bb44" : "#e10600" }}>{t.amount}</td>
                  <td style={{ padding: 8 }}>{new Date(t.transaction_time * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <div style={{ color: "#888", fontSize: 14, marginTop: 16 }}>
        {log.map((l, idx) => <div key={idx}>{l}</div>)}
      </div>
      <div style={{ marginTop: 40, color: "#e10600", fontSize: 12 }}>
        <b>Disclaimer:</b> Use your own Deriv API token. This tool never stores tokens. Copy trading is live and real!
      </div>
    </div>
  );
};

export default CopyTrading;