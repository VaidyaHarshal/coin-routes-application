import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";

const TIME_RANGE_OPTIONS = {
  "1d": {
    granularity: 3600,
    label: "Last 24 Hours",
    timeUnit: "hour",
    displayFormat: "MMM d, h a",
    range: 24 * 60 * 60 * 1000, // 1 day
  },
  "1w": {
    granularity: 21600,
    label: "Last 7 Days",
    timeUnit: "day",
    displayFormat: "MMM d",
    range: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  "1m": {
    granularity: 86400,
    label: "Last Month",
    timeUnit: "day",
    displayFormat: "MMM d",
    range: 30 * 24 * 60 * 60 * 1000, // 1 month
  },
  "6m": {
    granularity: 86400,
    label: "Last 6 Months",
    timeUnit: "month",
    displayFormat: "MMM yyyy",
    range: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months
  },
};

const fetchHistoricalData = async (pair, granularity) => {
  const url = `https://api.pro.coinbase.com/products/${pair}/candles?granularity=${granularity}`;
  const response = await fetch(url);
  const data = await response.json();

  return data
    .map(([time, , , , close]) => ({
      time: new Date(time * 1000),
      price: close,
    }))
    .sort((a, b) => a.time - b.time);
};

const HistoricalPriceChart = ({ pair }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [config, setConfig] = useState({
    lineColor: "#4bc0c0",
    showDataPoints: true,
    lineTension: 0.1,
  });
  const [timeRange, setTimeRange] = useState("1d");

  useEffect(() => {
    const { granularity } = TIME_RANGE_OPTIONS[timeRange] || {};
    if (granularity) {
      fetchHistoricalData(pair, granularity).then(setHistoricalData);
    }
  }, [pair, timeRange]);

  const { timeUnit, displayFormat, range } =
    TIME_RANGE_OPTIONS[timeRange] || {};

  const filteredData = (() => {
    if (timeRange === "1m") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return historicalData.filter((d) => d.time >= oneMonthAgo);
    } else if (timeRange === "6m") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return historicalData.filter((d) => d.time >= sixMonthsAgo);
    } else {
      return range
        ? historicalData.filter((d) => d.time >= Date.now() - range)
        : historicalData;
    }
  })();

  const xAxisMin = filteredData.length > 0 ? filteredData[0].time : undefined;
  const xAxisMax = new Date();

  const chartData = {
    datasets: [
      {
        label: "Historical Price",
        data: filteredData.map((d) => ({ x: d.time, y: d.price })),
        fill: false,
        borderColor: config.lineColor,
        tension: config.lineTension,
        pointRadius: config.showDataPoints ? 3 : 0,
      },
    ],
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-xl border border-gray-200 mb-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
        Historical Price Chart
      </h3>
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          Time Range:
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="ml-3 p-2 border border-gray-300 rounded-md cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          >
            {Object.entries(TIME_RANGE_OPTIONS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Line
        data={chartData}
        options={{
          plugins: {
            legend: {
              onClick: (e, legendItem, legend) => {
                e.stopPropagation();
              },
            },
          },
          scales: {
            x: {
              type: "time",
              time: {
                unit: timeUnit,
                tooltipFormat: "MMM d, yyyy",
                displayFormats: {
                  hour: "MMM d, h a",
                  day: "MMM d",
                  month: "MMM yyyy",
                  year: "yyyy",
                },
              },
              title: {
                display: true,
                text: "Date",
              },
              min: xAxisMin,
              max: xAxisMax,
              ticks: {
                source: "data",
                autoSkip: timeRange === "1m",
                padding: 10,
                stepSize: timeRange === "6m" ? 1 : undefined,
              },
              grid: {
                drawOnChartArea: true,
                drawBorder: false,
                borderColor: "#e0e0e0",
                borderWidth: 1,
                offset: true,
              },
            },
            y: {
              title: {
                display: true,
                text: "Price",
              },
              grid: {
                drawBorder: false,
                borderColor: "#e0e0e0",
                borderWidth: 1,
              },
              ticks: {
                padding: 10,
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
