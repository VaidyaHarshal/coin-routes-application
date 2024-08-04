import React, { useState } from "react";
import Dropdown from "./components/Dropdown";
import TopOfBook from "./components/TopOfBook";
import PriceChart from "./components/PriceChart";
import OrderBook from "./components/OrderBook";
import HistoricalPriceChart from "./components/HistoricalChart";

const App = () => {
  const [selectedPairs, setSelectedPairs] = useState([]);

  const handleSelectionChange = (pairs) => {
    setSelectedPairs(pairs);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-8">
        CoinRoutes Trading View
      </h1>
      <Dropdown onSelectionChange={handleSelectionChange} />
      {selectedPairs.map((pair) => (
        <div
          key={pair}
          className="widget-container mt-8 p-4 bg-white shadow-md rounded-lg"
        >
          <h2 className="text-2xl font-semibold mb-4">{pair}</h2>
          <TopOfBook pair={pair} />
          <PriceChart pair={pair} />
          <HistoricalPriceChart pair={pair} />
          <OrderBook pair={pair} />
        </div>
      ))}
    </div>
  );
};

export default App;
