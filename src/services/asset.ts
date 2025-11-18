export const getAssets = () => {
  return {
    assets: [
      {
        id: "usdt",
        name: "Tether USD",
        symbol: "USDT",
        decimals: 6,
        tokenAddress:
          "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
        echelonMarketObject: "0x447b3b516546f28e8c4f6825a6287b09161659e7c500c599c29c28a8492844b8",
      },
      {
        id: "usdc",
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        tokenAddress:
          "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
        echelonMarketObject: "0xa9c51ca3bcd93978d0c4aada7c4cf47c0791caced3cdc4e15f2c8e0797d1f93c",
      },
    ],
  };
};


export const getTokenDecimals = (tokenAddress: string): number => {
  const assets = getAssets().assets;
  const asset = assets.find(
    (a: any) => a.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
  );
  return asset?.decimals || 8; // Default to 8 if not found
};

export const getAssetName = (tokenAddress: string): string | null => {
    const assets = getAssets().assets;
    const asset = assets.find((a: any) => a.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
    return asset ? asset.symbol : null;
  };

export const getEchelonMarketObject = (tokenAddress: string): string | null => {
  const assets = getAssets().assets;
  const asset = assets.find((a: any) => a.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
  return asset ? asset.echelonMarketObject : null;
};