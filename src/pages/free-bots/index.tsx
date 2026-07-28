import React from 'react';

type BotInfo = {
  title: string;
  desc: string;
};

const bots: BotInfo[] = [
  { title: "2025 SOriginal 2025 Version 5 ($1)", desc: "Trading strategy using the 2025 SOriginal 2025 Version 5 ($1) system" },
  { title: "2025 Updated Expert Speed Bot Version", desc: "Trading strategy using the 2025 Updated Expert Speed Bot Version" },
  { title: "Alpha AI Two Predictions", desc: "Trading strategy using the Alpha AI Two Predictions system" }
];

const FreeBots: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Trading Bots Library</h2>
      <p>Click on a bot to load it in the Bot Builder</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        marginTop: 24,
      }}>
        {bots.map((bot, idx) => (
          <div key={bot.title + idx}
            style={{
              background: '#0d1933',
              borderRadius: 12,
              padding: 18,
              color: '#fff',
              border: '2px solid #1a1a40',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              minHeight: 150,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
            <div>
              <h3 style={{ color: '#ff444f', fontWeight: 'bold', fontSize: 18 }}>{bot.title}</h3>
              <p style={{ color: '#bdbdbd', fontSize: 13 }}>{bot.desc}</p>
            </div>
            <button style={{
              marginTop: 16,
              background: '#111',
              color: '#fff',
              borderRadius: 6,
              border: '1px solid #fff',
              padding: '10px 22px',
              fontWeight: 'bold',
              fontSize: 15,
              cursor: 'pointer',
              outline: 'none',
            }}
              onClick={() => alert(`Load Bot: ${bot.title}`)}
            >Load Bot</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreeBots;