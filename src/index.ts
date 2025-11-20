import express from 'express';
import { getMarketByAsset } from './services/market.js';
import { getUserPortfolio } from './services/portfolio.js';
import { getAssets } from './services/asset.js';
import { getAaveMarketData } from './services/aave.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Disable caching for all responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Endpoint 1: Get assets list (USDT, USDC with metadata)
app.get('/get-assets', (req, res) => {
  console.log("Getting assets list");
  const assets = getAssets();
  res.json(assets);
});

// Endpoint 2: Get market details by asset address
app.get('/get-markets-by-asset/:address', async (req, res) => {
  console.log("Getting market data for asset: ", req.params.address);
  const { address } = req.params;
  const marketData = await getMarketByAsset(address);
  res.json(marketData);
});

// Endpoint 3: Get market details by asset address and market
app.get('/get-market-details-by-asset/:address/:market', async (req, res) => {
  console.log("Getting market details for asset: ", req.params.address, " and market: ", req.params.market);
  const { address, market } = req.params;
  if(market === "aave") {
    const marketDetails = await getAaveMarketData(address);
    res.json(marketDetails);
  } else if(market === "echelon") {
    // const marketDetails = await getEchelonMarket(address);
    // res.json(marketDetails);
    res.status(400).json({ error: "Echelon market not available at this moment" });
  } else {
    res.status(400).json({ error: "Invalid market" });
  }
});

// Endpoint 4: Get user portfolio
app.get('/get-user-portfolio/:address', async (req, res) => {
  console.log("Getting user portfolio for address: ", req.params.address);
  const { address } = req.params;
  const portfolio = await getUserPortfolio(address);
  res.json(portfolio);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /get-assets`);
  console.log(`   GET /get-market-by-asset/:address`);
  console.log(`   GET /getuserportfolio/:address`);
});

