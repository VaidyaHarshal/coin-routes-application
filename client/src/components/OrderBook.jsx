import React, { useEffect, useState, useRef } from "react";

const OrderBook = ({ pair }) => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://ws-feed.pro.coinbase.com`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channels: [{ name: "level2_batch", product_ids: [pair] }],
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "snapshot" && data.product_id === pair) {
        console.log("Snapshot data:", data);
        setOrderBook({
          bids: data.bids.slice(0, 10),
          asks: data.asks.slice(0, 10),
        });
      } else if (data.type === "l2update" && data.product_id === pair) {
        // Process L2 update data
        // console.log("L2 update data:", data);
        setOrderBook((prevOrderBook) => {
          const newBids = [...prevOrderBook.bids];
          const newAsks = [...prevOrderBook.asks];

          data.changes.forEach(([side, price, size]) => {
            const orderList = side === "buy" ? newBids : newAsks;
            const orderIndex = orderList.findIndex(([p]) => p === price);
            const sizeFloat = parseFloat(size);

            if (sizeFloat === 0) {
              // Remove the order if size is 0
              if (orderIndex > -1) orderList.splice(orderIndex, 1);
            } else {
              // Update or add the order
              if (orderIndex > -1) {
                orderList[orderIndex] = [price, size];
              } else {
                orderList.push([price, size]);
              }
            }

            // Ensure orderList is sorted and truncated to 10 items
            orderList.sort(([p1], [p2]) => parseFloat(p1) - parseFloat(p2));
            if (side === "buy") orderList.reverse();
          });
          // console.log("Order data", orderBook.bids);

          return { bids: newBids.slice(0, 10), asks: newAsks.slice(0, 10) };
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

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
  }, [pair]);

  return (
    <div className="order-book border border-gray-300 p-4 rounded-md shadow-sm">
      <h3 className="text-xl font-semibold mb-2">Order Book</h3>
      <div className="flex justify-between">
        <div className="w-1/2 pr-2">
          <h4 className="text-lg font-medium mb-2 text-center">Bids</h4>
          {orderBook.bids.length === 0 ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <ul className="list-none text-red-500">
              {orderBook.bids.map(([price, size], index) => (
                <li key={index} className="flex justify-between">
                  <span>Price: {price}</span>
                  <span>Size: {size}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-1/2 pl-2">
          <h4 className="text-lg font-medium mb-2 text-center">Asks</h4>
          {orderBook.asks.length === 0 ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <ul className="list-none text-green-500">
              {orderBook.asks.map(([price, size], index) => (
                <li key={index} className="flex justify-between">
                  <span>Price: {price}</span>
                  <span>Size: {size}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
