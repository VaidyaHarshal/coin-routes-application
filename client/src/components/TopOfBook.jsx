import React, { useEffect, useState } from "react";

const TopOfBook = ({ pair }) => {
  const [topOfBook, setTopOfBook] = useState({ bid: null, ask: null });
  const [spread, setSpread] = useState(null);
  const [volume24h, setVolume24h] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket(`wss://ws-feed.pro.coinbase.com`);
    websocket.onopen = () => {
      websocket.send(
        JSON.stringify({
          type: "subscribe",
          channels: [{ name: "ticker", product_ids: [pair] }],
        })
      );
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "ticker" && data.product_id === pair) {
        setTopOfBook({ bid: data.best_bid, ask: data.best_ask });
        const bestBid = parseFloat(data.best_bid);
        const bestAsk = parseFloat(data.best_ask);
        setSpread(bestAsk - bestBid);
        setVolume24h(parseFloat(data.volume_24h) || 0); // Convert to number and handle NaN
      }
    };

    setWs(websocket);

    return () => {
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "unsubscribe",
              channels: [{ name: "ticker", product_ids: [pair] }],
            })
          );
        }
        ws.close();
      }
    };
  }, [pair]);

  return (
    <div className="top-of-book mb-4">
      <div className="text-lg">
        Best Bid: <span className="font-bold">{topOfBook.bid}</span>
      </div>
      <div className="text-lg">
        Best Ask: <span className="font-bold">{topOfBook.ask}</span>
      </div>
      {spread !== null && (
        <div className="text-lg">
          Spread: <span className="font-bold">{spread.toFixed(2)}</span>
        </div>
      )}
      {volume24h !== null && (
        <div className="text-lg">
          24 Hour Volume:{" "}
          <span className="font-bold">{volume24h.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export default TopOfBook;
