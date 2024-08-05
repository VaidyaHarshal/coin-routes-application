import React from "react";

const DESCRIPTION = [
  {
    pair: "BTC-USD",
    description:
      "Bitcoin (BTC) to US Dollar (USD). Shows how much one Bitcoin is worth in USD.",
  },
  {
    pair: "ETH-USD",
    description:
      "Ethereum (ETH) to US Dollar (USD). Shows how much one Ethereum is worth in USD.",
  },
  {
    pair: "LTC-USD",
    description:
      "Litecoin (LTC) to US Dollar (USD). Shows how much one Litecoin is worth in USD.",
  },
  {
    pair: "BCH-USD",
    description:
      "Bitcoin Cash (BCH) to US Dollar (USD). Shows how much one Bitcoin Cash is worth in USD.",
  },
];

const Description = () => {
  return (
    <div className="mb-4 text-center text-white">
      <div>
        <p className="text-center text-white mt-4">
          Select a pair to view the data.
        </p>
        {DESCRIPTION.map(({ pair, description }) => (
          <p key={pair} className="text-center text-white mt-4">
            {pair}: {description}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Description;
