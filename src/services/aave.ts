import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { getAssetName, getTokenDecimals } from './asset';

// Initialize Aptos client for mainnet
const config = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(config);

// Helper to get decimals for a token
const AAVE_ADDRESS = '0x39ddcd9e1a39fa14f25e3f9ec8a86074d05cc0881cbf667df8a6ee70942016fb';

// Get Aave reserve data for a token
export const getAaveReserveDataOverview = async (tokenAddress: string) => {
  try {
    // Call pool::get_reserve_data
    const reserveData = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::pool::get_reserve_data`,
        typeArguments: [],
        functionArguments: [tokenAddress]
      }
    });

    if (!reserveData || !reserveData[0]) {
      return { error: 'Reserve not found' };
    }

    // If reserve exists, get detailed data
    const reserveObject = reserveData[0] as { inner: string };
    
    const detailedData = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::pool_data_provider::get_reserve_data`,
        typeArguments: [],
        functionArguments: [tokenAddress]
      }
    });

    const decimals = getTokenDecimals(tokenAddress);
    const divisor = Math.pow(10, decimals);

    return {
      tokenAddress,
      reserveObject: reserveObject.inner,
      accruedToTreasury: Number(detailedData[0]) / divisor,
      totalATokenSupply: Number(detailedData[1]) / divisor,
      totalVariableDebt: Number(detailedData[2]) / divisor,
      supplyAPY: Number(detailedData[3])/Math.pow(10, 25),
      borrowAPY: Number(detailedData[4])/Math.pow(10, 25),
      liquidityIndex: detailedData[5],
      variableBorrowIndex: detailedData[6],
      lastUpdateTimestamp: detailedData[7]
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to fetch reserve data',
      tokenAddress
    };
  }
};


export const getAaveMarketData = async (tokenAddress: string) => {
  console.log("🔍 Getting Aave market data for token address: ", tokenAddress);
  try {
    // Call get_reserves_data - it returns all reserves
    const marketData = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::ui_pool_data_provider_v3::get_reserves_data`,
        typeArguments: [],
        functionArguments: [] // No arguments needed - returns all reserves
      }
    });

    console.log("✅ Raw Market Data received:", JSON.stringify(marketData, null, 2));

    // marketData returns a list of objects
    if (!marketData || !Array.isArray(marketData[0])) {
      console.log("❌ Market data format invalid");
      return { error: 'Market data not found or invalid format' };
    }

    const reserves = marketData[0] as Array<any>;
    console.log(`📊 Total reserves found: ${reserves.length}`);
    
    // Find the object where underlying_asset matches tokenAddress
    const matchingReserve = reserves.find((reserve: any) => {
      console.log(`  Checking reserve: ${reserve.underlying_asset}`);
      return reserve.underlying_asset === tokenAddress;
    });

    if (!matchingReserve) {
      console.log(`❌ No matching reserve found for ${tokenAddress}`);
      return { 
        error: 'No reserve found for the given token address',
        tokenAddress 
      };
    }

    console.log("✅ Matching reserve found!");
    // Return the whole matching object
    return matchingReserve;

  } catch (error: any) {
    console.error("❌ Error fetching market data:", error.message);
    return {
      error: error.message || 'Failed to fetch market data',
      tokenAddress
    };
  }
};
