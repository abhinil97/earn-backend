interface Position {
  market: string;
  amount: number;
  value: number;
  apy: number;
}

interface Portfolio {
  userAddress: string;
  totalValue: number;
  positions: Position[];
  lastUpdated: string;
}

export const getUserPortfolio = (address: string): Portfolio => {
  const portfolio = {
    userAddress: address,
    totalValue: 125000.50,
    positions: [
      {
        market: 'aave-usdt',
        amount: 5000,
        value: 45000.25,
        apy: 8.5
      },
      {
        market: 'aave-usdc',
        amount: 3500,
        value: 35000.00,
        apy: 7.2
      },
      {
        market: 'echelon-usdt',
        amount: 2500,
        value: 25000.15,
        apy: 12.3
      },
      {
        market: 'echelon-usdc',
        amount: 2000,
        value: 20000.10,
        apy: 10.8
      }
    ],
    lastUpdated: new Date().toISOString()
  };
  
  return portfolio;
};

