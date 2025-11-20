import { getAssetName, getEchelonMarketObject } from "./asset";
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const config = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(config);


const ECHLEON_ADDRESS = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";


export const getEchelonMarketOverview = async (tokenAddress: string) => {
  const normalizedAddress = tokenAddress.toLowerCase();
  const echelonMarketObject = getEchelonMarketObject(normalizedAddress);

  if (!echelonMarketObject) {
    return {
      error: 'No market object found for the given token address',
      tokenAddress,
      protocol: 'Echelon'
    };
  }

  const assetName = await aptos.view({
    payload: {
      function: `${ECHLEON_ADDRESS}::lending::market_asset_name`,
      typeArguments: [],
      functionArguments: [echelonMarketObject]
    }
  });

   const marketLiability = await aptos.view({
    payload: {
      function: `${ECHLEON_ADDRESS}::lending::market_total_liability`,
      typeArguments: [],
      functionArguments: [echelonMarketObject]
    }
  });
 

  if (!assetName) {
    return {
      error: 'No market data found for the given token address',
      tokenAddress,
      protocol: 'Echelon'
    };
  }
}

// Interface for Echelon user portfolio
export interface EchelonUserPortfolio {
  protocol: 'echelon';
  userAddress: string;
  reserves: any[]; // TODO: Define proper type when Echelon integration is ready
  totalCollateral: string;
  totalDebt: string;
  healthFactor: string;
}

// Get user portfolio from Echelon
// TODO: Implement when Echelon protocol integration is ready
export const getEchelonUserPortfolio = async (address: string): Promise<EchelonUserPortfolio | { error: string }> => {
  try {
    console.log("🔍 [Echelon] Getting user portfolio for address:", address);
    
    // TODO: Call Echelon smart contract to get user reserves data
    // Placeholder implementation
    console.log("⚠️ [Echelon] Integration not yet available");
    
    return {
      error: 'Echelon user portfolio integration not yet available'
    };

  } catch (error: any) {
    console.error("❌ [Echelon] Error fetching user portfolio:", error.message);
    return {
      error: error.message || 'Failed to fetch Echelon user portfolio data'
    };
  }
};