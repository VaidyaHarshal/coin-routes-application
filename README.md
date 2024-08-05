# CoinRoutes Trading Application

## Overview

CoinRoutes application is a comprehensive trading application designed to provide users with real-time price data and trading insights. The application includes various widgets for monitoring trading metrics, such as price charts and order books, and offers a customizable and user-friendly interface.

## Features

- **Real-Time Price Chart**: Visualizes live price data for selected currency pairs with customizable settings.
- **Trading Widgets**: Includes `TopOfBook`, `PriceChart`, `OrderBook`, and `HistoricalPriceChart` components.
- **Configurable Charts**: Adjust line color, data point visibility, and line tension.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **WebSocket Integration**: Fetches real-time trading data from the Coinbase Pro API.
- **Price Aggregation**: Handles price aggregation by set increments for accurate trading insights.

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js (v14 or later)
- npm or yarn

### Technologies Used

## Frontend

- **JavaScript:** A versatile, high-level programming language used for building interactive web applications and server-side development.
- **React.js:** A JavaScript library for building user interfaces, used for creating the application's components and managing state.
- **Chart.js:** A popular charting library used to create visualizations like line charts.
- **Tailwind CSS:** A utility-first CSS framework used for styling and responsive design.
- **WebSocket:** A protocol for full-duplex communication channels over a single TCP connection, used for real-time data updates from Coinbase Pro.

## API

- **Coinbase Pro API:** Provides real-time trading data for currency pairs through WebSocket connections.

### Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/VaidyaHarshal/coin-routes-application.git
   cd coin-routes-application
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the Development Server**

   ```bash
   npm start
   # or
   yarn start
   ```

   The application will be available at `http://localhost:5173/`.

## Usage

### Features

- **PriceChart**: Displays a line chart of real-time price data. Allows configuration of line color, data point visibility, and line tension.
- **TopOfBook**: Shows the top bid and ask prices for the selected currency pair.
- **OrderBook**: Lists buy and sell orders aggregated by set price increments.
- **HistoricalPriceChart**: Provides historical price data in a chart format.

### Configuration

The `PriceChart` and `Historical Chart` component includes the following customizable options:

- **Line Color**: Choose the color of the chart line.
- **Show Data Points**: Toggle the visibility of individual data points.
- **Line Tension**: Adjust the smoothness of the line.

### WebSocket Integration

The application uses WebSocket to receive real-time trading data from the Coinbase Pro API. The WebSocket endpoint is configured in the `PriceChart` component.

## Development

### Building for Production

To create a production build of the application, use:

```bash
npm run build
# or
yarn build
```

The build will be output to the `build` directory.

## Contact

For any questions or feedback, please contact [Harshal Vaidya](mailto:harshal.vaidya300@gmail.com).

---
