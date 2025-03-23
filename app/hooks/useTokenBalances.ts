import { useState, useEffect } from 'react';

type TokenInfo = {
  token: {
    address: string;
    name: string;
    symbol: string;
    icon_url: string;
    decimals: string;
  };
  value: string;
};

type NetworkConfig = {
  apiUrl: string;
};

type Networks = {
  [key: string]: NetworkConfig;
};

const networks: Networks = {
  "1": {
    apiUrl: 'https://eth.blockscout.com/api/v2/addresses',
  },
  "42161": {
    apiUrl: 'https://arbitrum.blockscout.com/api/v2/addresses',
  },
  "8453": {
    apiUrl: 'https://base.blockscout.com/api/v2/addresses',
  },
  "84532": {
    apiUrl: 'https://base-sepolia.blockscout.com/api/v2/addresses',
  },
  "11155111": {
    apiUrl: 'https://eth-sepolia.blockscout.com/api/v2/addresses',
  },
};

export const useTokenBalances = (safeAddress: string, chainId: number) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if no safe address or if chainId is invalid
    if (!safeAddress || chainId <= 0) return;
    
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    const fetchTokens = async () => {
      try {
        let response;
        if (process.env.NEXT_PUBLIC_MOCK_SAFE_ADDRESS) {
          response = await fetch(`${networks["1"].apiUrl}/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/token-balances`, {
            headers: { 'accept': 'application/json' }
          });

        } else {
          response = await fetch(`${networks[chainId.toString()].apiUrl}/${safeAddress}/token-balances`, {
            headers: { 'accept': 'application/json' }
          });
        }
        
        if (!response.ok) throw new Error(`Failed to fetch tokens: ${response.statusText}`);
        
        const data = await response.json();
        if (isMounted) setTokens(data);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchTokens();
    
    return () => { isMounted = false; };
  }, [safeAddress, chainId]);

  // Helper function to format token balance
  const formatBalance = (value: string, decimals: string): string => {
    const decimalValue = parseInt(decimals, 10);
    const valueNum = parseFloat(value) / Math.pow(10, decimalValue);
    return valueNum.toFixed(4);
  };

  return { tokens, loading, error, formatBalance };
};

export type { TokenInfo }; 