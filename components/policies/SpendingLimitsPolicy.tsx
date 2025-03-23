import React, { useState, useEffect } from 'react';
import { useTokenBalances } from '../../app/hooks/useTokenBalances';

type TokenPolicy = {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: string;
  limit: number;
};

type Props = {
  value: number;
  onChange: (value: number) => void;
  safeAddress: string;
  chainId: number;
  onTokenSelect?: (tokenAddress: string) => void;
  tokenPolicies: TokenPolicy[];
  onAddTokenPolicy: (policy: TokenPolicy) => void;
  onRemoveTokenPolicy: (tokenAddress: string) => void;
};

// Static tooltip text
export const TOOLTIP_TEXT = "Restricts the total amount that can be spent per erc-20 token. Once the limit is reached all subsequent transactions will be reverted.";

const SpendingLimitsPolicy: React.FC<Props> = ({ 
  value, 
  onChange, 
  safeAddress, 
  chainId, 
  onTokenSelect,
  tokenPolicies = [],
  onAddTokenPolicy,
  onRemoveTokenPolicy
}) => {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<{ symbol: string, name: string, decimals: string } | null>(null);
  const { tokens, loading, error, formatBalance } = useTokenBalances(safeAddress, chainId);

  // Set the first token as default when tokens are loaded
  useEffect(() => {
    if (tokens.length > 0 && !selectedToken) {
      const firstToken = tokens[0].token;
      setSelectedToken(firstToken.address);
      setSelectedTokenInfo({
        symbol: firstToken.symbol,
        name: firstToken.name,
        decimals: firstToken.decimals
      });
      if (onTokenSelect) {
        onTokenSelect(firstToken.address);
      }
    }
  }, [tokens, selectedToken, onTokenSelect]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tokenAddress = e.target.value;
    setSelectedToken(tokenAddress);
    
    // Find the selected token info
    const token = tokens.find(t => t.token.address === tokenAddress)?.token;
    if (token) {
      setSelectedTokenInfo({
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals
      });
    }
    
    if (onTokenSelect) {
      onTokenSelect(tokenAddress);
    }
  };

  const handleAddLimit = () => {
    if (selectedToken && selectedTokenInfo && value > 0) {
      onAddTokenPolicy({
        tokenAddress: selectedToken,
        tokenSymbol: selectedTokenInfo.symbol,
        tokenName: selectedTokenInfo.name,
        tokenDecimals: selectedTokenInfo.decimals,
        limit: value
      });
      
      // Reset the input value
      onChange(0);
    }
  };

  return (
    <div className="mt-2 space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Select Token</span>
        </label>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="loading loading-spinner loading-sm"></div>
            <span>Loading tokens...</span>
          </div>
        ) : error ? (
          <div className="text-error">{error}</div>
        ) : (
          <select 
            className="select select-bordered w-full"
            value={selectedToken}
            onChange={handleTokenChange}
            disabled={loading || tokens.length === 0}
          >
            {tokens.length === 0 && <option value="">No tokens available</option>}
            {tokens.map((item, index) => (
              <option key={`${item.token.address}-${index}`} value={item.token.address}>
                {item.token.symbol} - {item.token.name} ({formatBalance(item.value, item.token.decimals)})
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div>
        <label className="label">
          <span className="label-text">Spending Limit</span>
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="input input-bordered w-full"
          placeholder="Enter limit amount"
        />
      </div>
      
      <div className="flex justify-end">
        <button 
          className="btn btn-primary"
          onClick={handleAddLimit}
          disabled={!selectedToken || value <= 0}
        >
          Add Limit
        </button>
      </div>
      
      {tokenPolicies.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Configured Token Limits</h3>
          <div className="space-y-2">
            {tokenPolicies.map((policy) => (
              <div key={policy.tokenAddress} className="flex items-center justify-between bg-base-200 p-2 rounded">
                <div>
                  <span className="font-medium">{policy.tokenSymbol}</span> - {policy.tokenName}
                  <div className="text-sm">Limit: {policy.limit}</div>
                </div>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => onRemoveTokenPolicy(policy.tokenAddress)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingLimitsPolicy; 