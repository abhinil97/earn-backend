import { getAaveMarketData, getAaveReserveDataOverview } from './aave.js';
import { getAssetName, getTokenDecimals } from './asset.js';
import { getEchelonMarketOverview } from './echelon.js';

// Get Echelon market for a specific token address
// TODO: Replace with actual Echelon protocol integration
// export const getEchelonMarketOverview = (tokenAddress: string) => {
//   const normalizedAddress = tokenAddress.toLowerCase();
//   const assetName = getAssetName(normalizedAddress);

//   if (!assetName) {
//     return {
//       error: 'No market data found for the given token address',
//       tokenAddress,
//       protocol: 'Echelon'
//     };
//   }

//   // Mock data - simulating Echelon protocol response
//   // TODO: Replace with actual blockchain/API call to Echelon


//   return {error: "Echelon market not available at this moment"};
// };

// Get market details by asset address
// Aggregates markets from both Aave and Echelon protocols
export const getMarketByAsset = async (assetAddress: string) => {
  const normalizedAddress = assetAddress.toLowerCase();
  const assetName = getAssetName(normalizedAddress);
  
  if (!assetName) {
    return {
      error: 'Market not found for the given asset address',
      tokenAddress: assetAddress
    };
  }

  // Fetch markets from both protocols
  const aaveMarket = await getAaveReserveDataOverview(normalizedAddress);
  const echelonMarket = await getEchelonMarketOverview(normalizedAddress);

  // Collect available markets
  const markets = [];
  
  if (!('error' in aaveMarket)) {
    markets.push(aaveMarket);
  }
  
  if (echelonMarket && !('error' in echelonMarket)) {
    markets.push(echelonMarket);
  }

  // If no markets available from either protocol
  if (markets.length === 0) {
    return {
      error: 'No markets available for this asset',
      asset: assetName,
      tokenAddress: normalizedAddress
    };
  }

  return {
    asset: assetName,
    tokenAddress: normalizedAddress,
    markets
  };
};

