import React, { useState } from "react";

const Dropdown = ({ onSelectionChange }) => {
  const [selectedPairs, setSelectedPairs] = useState([]);

  const handleChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions);
    const pairs = selectedOptions.map((option) => option.value);
    setSelectedPairs(pairs);
    onSelectionChange(pairs);
  };

  return (
    <div className="mb-8 p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-lg">
      <label className="block text-2xl font-semibold text-white mb-4">
        Select Currency Pairs:
      </label>
      <select
        multiple
        value={selectedPairs}
        onChange={handleChange}
        className="block w-full p-4 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-transform transform hover:scale-105"
      >
        <option value="BTC-USD">BTC-USD</option>
        <option value="ETH-USD">ETH-USD</option>
        <option value="LTC-USD">LTC-USD</option>
        <option value="BCH-USD">BCH-USD</option>
      </select>
    </div>
  );
};

export default Dropdown;
