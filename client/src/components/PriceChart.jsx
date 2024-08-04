import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const PriceChart = ({ pair }) => {
  const [priceData, setPriceData] = useState([]);
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
        setPriceData((prevData) => [
          ...prevData.slice(-99),
          { time: new Date(), price: parseFloat(data.price) },
        ]);
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

  const chartData = {
    labels: priceData.map((d) => d.time.toLocaleTimeString()),
    datasets: [
      {
        label: "Price",
        data: priceData.map((d) => d.price),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="price-chart mb-4">
      <Line data={chartData} />
    </div>
  );
};

export default PriceChart;
