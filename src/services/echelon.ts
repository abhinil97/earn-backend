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