import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns"; // Import the date adapter

const HistoricalPriceChart = ({ pair }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [config, setConfig] = useState({
    lineColor: "#4bc0c0", // Default hex color
    showDataPoints: true,
    lineTension: 0.1,
  });

  useEffect(() => {
    const fetchHistoricalData = async () => {
      const url = `https://api.pro.coinbase.com/products/${pair}/candles?granularity=3600`;
      const response = await fetch(url);
      const data = await response.json();

      // Process the data to match chart.js format
      const formattedData = data.map(
        ([time, low, high, open, close, volume]) => ({
          time: new Date(time * 1000), // Convert to milliseconds
          price: close,
        })
      );

      // Sort data in chronological order: oldest to newest
      const sortedData = formattedData.sort((a, b) => a.time - b.time);

      setHistoricalData(sortedData);
    };

    fetchHistoricalData();
  }, [pair]);

  const chartData = {
    datasets: [
      {
        label: "Historical Price",
        data: historicalData.map((d) => ({ x: d.time, y: d.price })),
        fill: false,
        borderColor: config.lineColor,
        tension: config.lineTension,
        pointRadius: config.showDataPoints ? 3 : 0, // Show/hide data points
      },
    ],
  };

  return (
    <div className="historical-price-chart mb-4 p-4 bg-white shadow-md rounded-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
        Historical Price Chart
      </h3>
      <Line
        data={chartData}
        options={{
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
                tooltipFormat: "MMM d, yyyy",
                displayFormats: {
                  day: "MMM d",
                  month: "MMM yyyy",
                  year: "yyyy",
                },
              },
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              title: {
                display: true,
                text: "Price",
              },
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

export default HistoricalPriceChart;
