import { getAaveUserPortfolio, AaveUserPortfolio } from './aave';
import { getEchelonUserPortfolio, EchelonUserPortfolio } from './echelon';

// Aggregated portfolio interface
interface Portfolio {
  userAddress: string;
  protocols: {
    aave?: AaveUserPortfolio;
    echelon?: EchelonUserPortfolio;
  };
  errors?: {
    aave?: string;
    echelon?: string;
  };
}

// Get user portfolio aggregated from all protocols
export const getUserPortfolio = async (address: string): Promise<Portfolio> => {
  console.log("🔍 Getting aggregated user portfolio for address:", address);
  
  const portfolio: Portfolio = {
    userAddress: address,
    protocols: {},
    errors: {}
  };

  // Fetch from Aave
  const aavePortfolio = await getAaveUserPortfolio(address);
  if ('error' in aavePortfolio) {
    console.log("⚠️ Aave portfolio error:", aavePortfolio.error);
    portfolio.errors!.aave = aavePortfolio.error;
  } else {
    portfolio.protocols.aave = aavePortfolio;
  }

  // Fetch from Echelon
  const echelonPortfolio = await getEchelonUserPortfolio(address);
  if ('error' in echelonPortfolio) {
    console.log("⚠️ Echelon portfolio error:", echelonPortfolio.error);
    portfolio.errors!.echelon = echelonPortfolio.error;
  } else {
    portfolio.protocols.echelon = echelonPortfolio;
  }

  // Clean up errors object if empty
  if (Object.keys(portfolio.errors || {}).length === 0) {
    delete portfolio.errors;
  }

  console.log("✅ Aggregated portfolio ready");
  return portfolio;
};

