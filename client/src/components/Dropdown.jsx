import React, { useState } from "react";

const Dropdown = ({ onSelectionChange }) => {
  const [selectedPairs, setSelectedPairs] = useState([]);

  const handleChange = (event) => {
    const { options } = event.target;
    const pairs = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        pairs.push(options[i].value);
      }
    }
    setSelectedPairs(pairs);
    onSelectionChange(pairs);
  };

  return (
    <div className="mb-8">
      <label className="block text-lg font-medium mb-2">
        Select Currency Pairs:
      </label>
      <select
        multiple={true}
        value={selectedPairs}
        onChange={handleChange}
        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
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
