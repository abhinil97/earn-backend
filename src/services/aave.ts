import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { getAssets, getTokenDecimals } from './asset';

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
      return { error: 'Market data not found or invalid format' };
    }

    const reserves = marketData[0] as Array<any>;
    console.log(`📊 Total reserves found: ${reserves.length}`);
    
    // Find the object where underlying_asset matches tokenAddress
    const matchingReserve = reserves.find((reserve: any) => {
      return reserve.underlying_asset === tokenAddress;
    });

    if (!matchingReserve) {
      return { 
        error: 'No reserve found for the given token address',
        tokenAddress 
      };
    }

    // Return the whole matching object
    return matchingReserve;

  } catch (error: any) {
    return {
      error: error.message || 'Failed to fetch market data',
      tokenAddress
    };
  }
};

export const getReserveTokenAddresses = async (tokenAddress: string) => {
  try {
    const reserveTokenAddresses = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::pool_data_provider::get_reserve_tokens_addresses`,
        typeArguments: [],
        functionArguments: [tokenAddress]
      }
    });
    return {
      reserve_a_token_address: reserveTokenAddresses[0],
      reserve_variable_debt_token_address: reserveTokenAddresses[1],
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to fetch reserve token addresses'
    };
  }
};


export const getReserveATokenDataForUser = async (tokenAddress: string, address: string) => {
  try {

    const isATokenAddress = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::a_token_factory::is_atoken`,
        typeArguments: [],
        functionArguments: [tokenAddress]
      }
    });
    
    if(!isATokenAddress) {
      return {
        error: 'Token is not an Aave AToken'
      };
    }
    
    const reserveTokenName = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::a_token_factory::name`,
        typeArguments: [],
        functionArguments: [tokenAddress]
      }
    });

    const reserveTokenSymbol = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::a_token_factory::symbol`,
        typeArguments: [],
        functionArguments: [tokenAddress]
      }
    });

    const reserveTokenDecimals = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::a_token_factory::decimals`,
        typeArguments: [],
        functionArguments: [tokenAddress]
      }
    });

    const userReserveTokenBalance = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::a_token_factory::balance_of`,
        typeArguments: [],
        functionArguments: [address, tokenAddress]
      }
    });

    const userReserveTokenBalanceScaled = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::a_token_factory::scaled_balance_of`,
        typeArguments: [],
        functionArguments: [address, tokenAddress]
      }
    });
    
    return {
      reserve_token_name: reserveTokenName[0],
      reserve_token_symbol: reserveTokenSymbol[0],
      reserve_token_decimals: reserveTokenDecimals[0],
      user_reserve_token_balance: userReserveTokenBalance[0],
      user_reserve_token_balance_scaled: userReserveTokenBalanceScaled[0]
    };
    
  } catch (error: any) {
    return {
      error: error.message || 'Failed to fetch reserve AToken data for user'
    };
  }
};

// Interface for Aave user portfolio
export interface AaveUserPortfolio {
  protocol: 'aave';
  userAddress: string;
  totalCollateralBase: string;
  totalDebtBase: string;
  availableBorrowsBase: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
  userAssetData: any[];
  
}

// Get user portfolio from Aave
export const getAaveUserPortfolio = async (address: string): Promise<AaveUserPortfolio | { error: string }> => {
  try {
    console.log("🔍 [Aave] Getting user portfolio for address:", address);
    
    // Call user_logic::get_user_account_data
    // Returns: (total_collateral_base, total_debt_base, available_borrows_base, current_liquidation_threshold, ltv, health_factor)
    const userAccountDataOverview = await aptos.view({
      payload: {
        function: `${AAVE_ADDRESS}::user_logic::get_user_account_data`,
        typeArguments: [],
        functionArguments: [address]
      }
    });

    if (!userAccountDataOverview || !Array.isArray(userAccountDataOverview)) {
      return { error: 'Aave user account data not found or invalid format' };
    }

    const userAssetData = [];
    const supportedAssets = getAssets();
    for(const asset of supportedAssets.assets) {
      console.log("🔍 Getting user reserve data for asset: ", asset.tokenAddress);
      const user_reserve_data = await aptos.view({
        payload: {
          function: `${AAVE_ADDRESS}::pool_data_provider::get_user_reserve_data`,
          typeArguments: [],
          functionArguments: [asset.tokenAddress, address]
        }
      });

      const reserveTokenAddresses = await getReserveTokenAddresses(asset.tokenAddress);
      const reserve_a_token_data_for_user = await getReserveATokenDataForUser(String(reserveTokenAddresses.reserve_a_token_address), address);

      if(reserve_a_token_data_for_user && !Array.isArray(reserve_a_token_data_for_user)) {
        if(user_reserve_data && Array.isArray(user_reserve_data)) {
          userAssetData.push({
            asset: asset.name,
            tokenAddress: asset.tokenAddress,
            current_a_token_balance: (Number(user_reserve_data[0])).toString() || '0',
            current_variable_debt: (Number(user_reserve_data[1])).toString() || '0',
            scaled_variable_debt: (Number(user_reserve_data[2])).toString() || '0',
            liquidity_rate: (Number(user_reserve_data[3])/10**25).toString() || '0',
            usgae_as_collateral_enabled: user_reserve_data[4] as boolean || false,
            reserve_a_token_data_for_user: reserve_a_token_data_for_user
          });
        }
      }
    }

    return {
      protocol: 'aave',
      userAddress: address,
      totalCollateralBase: (Number(userAccountDataOverview[0])/10**18).toString() || '0',
      totalDebtBase: (Number(userAccountDataOverview[1])/10**18).toString() || '0',
      availableBorrowsBase: (Number(userAccountDataOverview[2])/10**18).toString() || '0',
      currentLiquidationThreshold: userAccountDataOverview[3]?.toString() || '0',
      ltv: userAccountDataOverview[4]?.toString() || '0',
      healthFactor: userAccountDataOverview[5]?.toString() || '0',
      userAssetData: userAssetData
    };

  } catch (error: any) {
    return {
      error: error.message || 'Failed to fetch Aave user portfolio data'
    };
  }
};


