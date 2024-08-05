import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import _ from "lodash";

// Helper function to format numbers with fixed decimal places
const formatNumber = (number, decimals = 4) => Number(number).toFixed(decimals);

// Helper function to aggregate prices based on the specified increment
const aggregateByIncrement = (orders, increment) => {
  const aggregated = {};

  orders.forEach(([price, size]) => {
    const priceFloat = parseFloat(price);
    const sizeFloat = parseFloat(size);

    if (isNaN(priceFloat) || isNaN(sizeFloat)) return;

    // Round the price to the nearest increment
    const roundedPrice = Math.round(priceFloat / increment) * increment;

    if (!aggregated[roundedPrice]) {
      aggregated[roundedPrice] = 0;
    }

    aggregated[roundedPrice] += sizeFloat;
  });

  return Object.entries(aggregated)
    .map(([price, size]) => ({ price, size }))
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
};

const BUCKET_SIZES = [0.01, 0.05, 0.1];
const MAX_ROWS = 10; // Maximum number of rows to display

const OrderBook = ({ pair }) => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [priceIncrement, setPriceIncrement] = useState(BUCKET_SIZES[0]); // Default to the first option
  const wsRef = useRef(null);

  const handleWebSocketData = useCallback(
    (data) => {
      if (data.type === "snapshot" && data.product_id === pair) {
        console.log("Snapshot data:", data);
        setOrderBook({
          bids: data.bids.slice(0, MAX_ROWS),
          asks: data.asks.slice(0, MAX_ROWS),
        });
      } else if (data.type === "l2update" && data.product_id === pair) {
        setOrderBook((prevOrderBook) => {
          const newBids = [...prevOrderBook.bids];
          const newAsks = [...prevOrderBook.asks];

          data.changes.forEach(([side, price, size]) => {
            const orderList = side === "buy" ? newBids : newAsks;
            const orderIndex = orderList.findIndex(([p]) => p === price);
            const sizeFloat = parseFloat(size);

            if (sizeFloat === 0) {
              if (orderIndex > -1) orderList.splice(orderIndex, 1);
            } else {
              if (orderIndex > -1) {
                orderList[orderIndex] = [price, size];
              } else {
                orderList.push([price, size]);
              }
            }

            orderList.sort(([p1], [p2]) => parseFloat(p1) - parseFloat(p2));
            if (side === "buy") orderList.reverse();
          });

          return {
            bids: newBids.slice(0, MAX_ROWS),
            asks: newAsks.slice(0, MAX_ROWS),
          };
        });
      }
    },
    [pair]
  );

  // Throttle the WebSocket updates
  const throttledHandleWebSocketData = useCallback(
    _.throttle(handleWebSocketData, 100),
    [handleWebSocketData]
  );

  useEffect(() => {
    let ws;
    let retryAttempts = 0;
    const maxRetries = 5; // Maximum number of retry attempts

    const createWebSocket = () => {
      ws = new WebSocket(`wss://ws-feed.pro.coinbase.com`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection opened");
        ws.send(
          JSON.stringify({
            type: "subscribe",
            channels: [{ name: "level2_batch", product_ids: [pair] }],
          })
        );
        retryAttempts = 0; // Reset retry attempts on successful connection
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        throttledHandleWebSocketData(data);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // Close the connection to trigger onclose event
      };

      ws.onclose = (event) => {
        console.log("WebSocket connection closed", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        if (retryAttempts < maxRetries) {
          retryAttempts++;
          const retryDelay = Math.min(1000 * Math.pow(2, retryAttempts), 30000); // Exponential backoff
          console.log(`Retrying in ${retryDelay / 1000} seconds...`);
          setTimeout(createWebSocket, retryDelay); // Retry connection after delay
        } else {
          console.error("Max retry attempts reached. Could not reconnect.");
        }
      };
    };

    createWebSocket();

    return () => {
      const currentWs = wsRef.current;
      if (currentWs) {
        if (currentWs.readyState === WebSocket.OPEN) {
          currentWs.send(
            JSON.stringify({
              type: "unsubscribe",
              channels: [{ name: "level2_batch", product_ids: [pair] }],
            })
          );
        }
        currentWs.close();
      }
    };
  }, [pair, throttledHandleWebSocketData]);

  const bidMarketSizes = useMemo(() => {
    return aggregateByIncrement(orderBook.bids, priceIncrement);
  }, [orderBook.bids, priceIncrement]);

  const askMarketSizes = useMemo(() => {
    return aggregateByIncrement(orderBook.asks, priceIncrement);
  }, [orderBook.asks, priceIncrement]);

  return (
    <div className="order-book border border-gray-300 p-4 rounded-md shadow-sm">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
        Order Book
      </h3>
      <div className="mb-6">
        <label
          htmlFor="bucket-size"
          className="block text-sm font-medium text-gray-800 mb-3"
        >
          Aggregation:
        </label>

        <select
          id="bucket-size"
          value={priceIncrement}
          onChange={(e) => setPriceIncrement(parseFloat(e.target.value))}
          className="block w-full border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
        >
          {BUCKET_SIZES.map((size) => (
            <option key={size} value={size} className="text-gray-900">
              ${formatNumber(size, 2)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between h-[420px] bg-gray-50 p-4 rounded-lg shadow-md">
        {/* Bids Section */}
        <div className="w-1/2 pr-2 bg-white rounded-lg shadow-inner overflow-hidden">
          <h4 className="text-xl font-semibold mb-4 text-center text-gray-800 border-b-2 border-green-500 pb-2">
            Bids
          </h4>
          <div className="flex">
            {/* Price Column */}
            <div className="w-1/2 text-center border-r border-gray-300">
              <h5 className="font-medium mb-2 text-gray-600">Price</h5>
              <ul className="list-none text-green-500 flex-1 overflow-y-auto">
                {bidMarketSizes.map(({ price }, index) => (
                  <li
                    key={index}
                    className="flex justify-center py-1 border-b border-gray-200"
                  >
                    <span className="text-sm">${formatNumber(price)}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Market Size Column */}
            <div className="w-1/2 text-center">
              <h5 className="font-medium mb-2 text-gray-600">Market Size</h5>
              <ul className="list-none text-green-500 flex-1 overflow-y-auto">
                {bidMarketSizes.map(({ size }, index) => (
                  <li
                    key={index}
                    className="flex justify-center py-1 border-b border-gray-200"
                  >
                    <span className="text-sm">{formatNumber(size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Asks Section */}
        <div className="w-1/2 pl-2 bg-white rounded-lg shadow-inner overflow-hidden">
          <h4 className="text-xl font-semibold mb-4 text-center text-gray-800 border-b-2 border-red-500 pb-2">
            Asks
          </h4>
          <div className="flex">
            {/* Price Column */}
            <div className="w-1/2 text-center border-r border-gray-300">
              <h5 className="font-medium mb-2 text-gray-600">Price</h5>
              <ul className="list-none text-red-500 flex-1 overflow-y-auto">
                {askMarketSizes.map(({ price }, index) => (
                  <li
                    key={index}
                    className="flex justify-center py-1 border-b border-gray-200"
                  >
                    <span className="text-sm">${formatNumber(price)}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Market Size Column */}
            <div className="w-1/2 text-center">
              <h5 className="font-medium mb-2 text-gray-600">Market Size</h5>
              <ul className="list-none text-red-500 flex-1 overflow-y-auto">
                {askMarketSizes.map(({ size }, index) => (
                  <li
                    key={index}
                    className="flex justify-center py-1 border-b border-gray-200"
                  >
                    <span className="text-sm">{formatNumber(size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
