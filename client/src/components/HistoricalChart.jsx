import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns"; // Import the date adapter

const HistoricalPriceChart = ({ pair }) => {
  const [historicalData, setHistoricalData] = useState([]);

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
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="historical-price-chart mb-4">
      <h3 className="text-xl font-semibold mb-2">Historical Price Chart</h3>
      <Line
        data={chartData}
        options={{
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
                tooltipFormat: "MMM d, yyyy", // Correct date format
                displayFormats: {
                  day: "MMM d", // Format for day labels
                  month: "MMM yyyy", // Format for month labels
                  year: "yyyy", // Format for year labels
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
    </div>
  );
};

export default HistoricalPriceChart;
