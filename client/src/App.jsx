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
    <div className="min-h-screen p-8 bg-slate-900">
      <h1 className="text-4xl font-bold text-white text-center mb-8">
        CoinRoutes Trading View
      </h1>
      <Dropdown onSelectionChange={handleSelectionChange} />
      {selectedPairs.length === 0 ? (
        <p className="text-center text-white mt-4">
          Select a pair to view the data.
        </p>
      ) : (
        selectedPairs.map((pair) => (
          <div
            key={pair}
            className="widget-container mt-8 p-6 bg-white shadow-lg rounded-xl border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {pair}
            </h2>
            <div className="space-y-6">
              <TopOfBook pair={pair} />
              <PriceChart pair={pair} />
              <HistoricalPriceChart pair={pair} />
              <OrderBook pair={pair} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default App;
