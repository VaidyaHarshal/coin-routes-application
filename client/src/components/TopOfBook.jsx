import React, { useCallback, useEffect, useState } from "react";

const TopOfBook = ({ pair }) => {
  const [topOfBook, setTopOfBook] = useState({ bid: null, ask: null });
  const [spread, setSpread] = useState(null);
  const [volume24h, setVolume24h] = useState(null);
  const [ws, setWs] = useState(null);

  // Local state for widget configuration
  const [config, setConfig] = useState({
    showBid: true,
    showAsk: true,
    showSpread: true,
    showVolume24h: true,
  });

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

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
        const bestBid = parseFloat(data.best_bid);
        const bestAsk = parseFloat(data.best_ask);
        setTopOfBook({ bid: bestBid, ask: bestAsk });
        setSpread(bestAsk - bestBid);
        setVolume24h(parseFloat(data.volume_24h) || 0);
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

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: checked,
    }));
  };

  return (
    <div className="top-of-book p-4 bg-white shadow-lg rounded-xl border border-gray-200 mb-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
        Top of Book
      </h3>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="showBid"
            checked={config.showBid}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-lg text-gray-700">Bid</label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="showAsk"
            checked={config.showAsk}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-lg text-gray-700">Ask</label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="showSpread"
            checked={config.showSpread}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-lg text-gray-700">Spread</label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="showVolume24h"
            checked={config.showVolume24h}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-lg text-gray-700">24h Volume</label>
        </div>
      </div>
      {config.showBid && (
        <div className="text-lg text-gray-800 mb-2">
          <span className="font-medium">Best Bid:</span>{" "}
          <span className="font-semibold text-green-600">
            {topOfBook.bid !== null ? formatCurrency(topOfBook.bid) : "N/A"}
          </span>
        </div>
      )}
      {config.showAsk && (
        <div className="text-lg text-gray-800 mb-2">
          <span className="font-medium">Best Ask:</span>{" "}
          <span className="font-semibold text-red-600">
            {topOfBook.ask !== null ? formatCurrency(topOfBook.ask) : "N/A"}
          </span>
        </div>
      )}
      {config.showSpread && spread !== null && (
        <div className="text-lg text-gray-800 mb-2">
          <span className="font-medium">Spread:</span>{" "}
          <span className="font-semibold text-yellow-600">
            {formatCurrency(spread)}
          </span>
        </div>
      )}
      {config.showVolume24h && volume24h !== null && (
        <div className="text-lg text-gray-800">
          <span className="font-medium">24 Hour Volume:</span>{" "}
          <span className="font-semibold text-blue-600">
            {volume24h.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default TopOfBook;
