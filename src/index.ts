import express from 'express';
import { getMarketsList } from './services/marketService';
import { getUserPortfolio } from './services/portfolioService';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Endpoint 1: Get markets list
app.get('/getmarketslist', (req, res) => {
  const markets = getMarketsList();
  res.json(markets);
});

// Endpoint 2: Get user portfolio
app.get('/getuserportfolio/:address', (req, res) => {
  const { address } = req.params;
  const portfolio = getUserPortfolio(address);
  res.json(portfolio);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /getmarketslist`);
  console.log(`   GET /getuserportfolio/:address`);
});

