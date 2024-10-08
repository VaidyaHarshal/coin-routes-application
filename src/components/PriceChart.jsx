import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date) => {
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/New_York",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const PriceChart = ({ pair }) => {
  const [priceData, setPriceData] = useState([]);
  const [ws, setWs] = useState(null);

  // Local state for chart configuration
  const [config, setConfig] = useState({
    chartType: "line",
    lineColor: "#4bc0c0",
    showDataPoints: true,
    lineTension: 0.1,
  });

  useEffect(() => {
    const websocket = new WebSocket(`wss://advanced-trade-ws.coinbase.com`);
    const tempData = [];

    websocket.onopen = () => {
      websocket.send(
        JSON.stringify({
          type: "subscribe",
          product_ids: [pair],
          channel: "ticker",
        })
      );
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.channel === "ticker" && data.events && data.events[0].tickers) {
        tempData.push({
          time: new Date(),
          price: parseFloat(data.events[0].tickers[0].price),
        });
        if (tempData.length > 100) tempData.shift();
      }
    };

    setWs(websocket);

    const interval = setInterval(() => {
      setPriceData([...tempData]);
    }, 5000);

    return () => {
      clearInterval(interval);
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
        borderColor: config.lineColor,
        tension: config.lineTension,
        pointRadius: config.showDataPoints ? 3 : 0,
      },
    ],
  };

  const latestPrice =
    priceData.length > 0
      ? formatCurrency(priceData[priceData.length - 1].price)
      : "Loading...";
  const latestTime =
    priceData.length > 0
      ? formatDate(priceData[priceData.length - 1].time)
      : "";

  return (
    <div className="p-4 bg-white shadow-lg rounded-xl border border-gray-200 mb-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
        Price Chart
      </h3>
      <div className="text-lg text-gray-800 mb-2">
        <span className="font-medium">Real-Time Price:</span>
        <span className="font-bold text-green-500">{latestPrice}</span>
      </div>
      <h6 className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200 shadow-sm">
        As of <span className="font-semibold text-gray-900">{latestTime} </span>
        EDT
      </h6>
      <Line
        data={chartData}
        options={{
          plugins: {
            legend: {
              onClick: (e) => {
                e.stopPropagation();
              },
            },
          },
          scales: {
            y: {
              type: "linear",
            },
          },
        }}
      />
      <div className="mt-4 space-y-4">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          Line Color:
          <input
            type="color"
            value={config.lineColor}
            onChange={(e) =>
              setConfig({ ...config, lineColor: e.target.value })
            }
            className="ml-3 h-8 w-8 border-none rounded-sm cursor-pointer"
          />
        </label>
        <label className="text-sm font-medium text-gray-700 flex items-center">
          Show Data Points:
          <input
            type="checkbox"
            checked={config.showDataPoints}
            onChange={(e) =>
              setConfig({ ...config, showDataPoints: e.target.checked })
            }
            className="ml-3 h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer"
          />
        </label>
        <label className="text-sm font-medium text-gray-700 flex items-center">
          Line Tension:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.lineTension}
            onChange={(e) =>
              setConfig({ ...config, lineTension: parseFloat(e.target.value) })
            }
            className="ml-3 w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

export default PriceChart;
