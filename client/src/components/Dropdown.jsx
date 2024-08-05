import React from "react";

// Array of currency pairs
const OPTIONS = [
  { value: "BTC-USD", label: "BTC-USD" },
  { value: "ETH-USD", label: "ETH-USD" },
  { value: "LTC-USD", label: "LTC-USD" },
  { value: "BCH-USD", label: "BCH-USD" },
];

const Dropdown = ({ onSelectionChange }) => {
  // Handle selection change
  const handleChange = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    onSelectionChange(selectedOptions);
  };

  return (
    <div className="mb-8 p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-lg">
      <label className="block text-2xl font-semibold text-white mb-4">
        Select Currency Pairs:
      </label>
      <select
        multiple
        onChange={handleChange}
        className="block w-full p-4 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
      >
        {OPTIONS.map(({ value, label }) => (
          <option
            key={value}
            value={value}
            className="hover:bg-gray-300 font-semibold"
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
