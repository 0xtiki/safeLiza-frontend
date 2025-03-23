import React, { useState } from 'react';
import SpendingLimitsPolicy, { TOOLTIP_TEXT as SPENDING_LIMITS_TOOLTIP } from './SpendingLimitsPolicy';
import TimeFramePolicy, { TOOLTIP_TEXT as TIME_FRAME_TOOLTIP } from './TimeFramePolicy';
import UniversalActionPolicy, { TOOLTIP_TEXT as UNIVERSAL_ACTION_TOOLTIP } from './UniversalActionPolicy';
import ValueLimitPolicy, { TOOLTIP_TEXT as VALUE_LIMIT_TOOLTIP } from './ValueLimitPolicy';
import SudoPolicy, { TOOLTIP_TEXT as SUDO_TOOLTIP } from './SudoPolicy';

type PolicyConfig = {
  spendingLimitsPolicy: { 
    limit: number; 
    active: boolean; 
    tokenAddress: string;
    tokenPolicies: Array<{
      tokenAddress: string;
      tokenSymbol: string;
      tokenName: string;
      tokenDecimals: string;
      limit: number;
    }>;
  };
  timeFramePolicy: { startTime: string; endTime: string; active: boolean };
  universalActionPolicy: { usageCount: number; active: boolean };
  valueLimitPolicy: { valueLimit: number; active: boolean };
  sudoPolicy: { active: boolean };
};

type PolicyKey = keyof PolicyConfig;

type TokenPolicy = {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: string;
  limit: number;
};

type Props = {
  policyConfigs: PolicyConfig;
  handlePolicyConfigChange: (policy: PolicyKey, field: string, value: string | number | boolean | Array<TokenPolicy>) => void;
  safeAddress: string;
  chainId: number;
};

const PolicyConfiguration: React.FC<Props> = ({ policyConfigs, handlePolicyConfigChange, safeAddress, chainId }) => {
  const [isSudoPolicySelected, setIsSudoPolicySelected] = useState(false);

  const handleSudoPolicyChange = (value: boolean) => {
    setIsSudoPolicySelected(value);
    handlePolicyConfigChange('sudoPolicy', 'active', value);
  };

  // User-friendly policy names mapping
  const policyLabels: Record<string, string> = {
    'sudoPolicy': 'Full Access (Admin Mode)',
    'spendingLimitsPolicy': 'Token Spending Limit',
    'timeFramePolicy': 'Time Window Restriction',
    'universalActionPolicy': 'Contract Interaction Control',
    'valueLimitPolicy': 'ETH Spending Limit'
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label cursor-pointer flex items-center">
          <input
            type="checkbox"
            checked={isSudoPolicySelected}
            onChange={(e) => handleSudoPolicyChange(e.target.checked)}
            className="checkbox mr-2"
          />
          <span className="label-text font-medium">{policyLabels['sudoPolicy']}</span>
          <div className="tooltip ml-2" data-tip={SUDO_TOOLTIP}>
            <span className="text-base-content/60 cursor-help">ⓘ</span>
          </div>
        </label>
        {isSudoPolicySelected && (
          <SudoPolicy
            active={policyConfigs.sudoPolicy.active}
            onChange={(value) => handlePolicyConfigChange('sudoPolicy', 'active', value)}
          />
        )}
      </div>
      {!isSudoPolicySelected && (
        <>
          {['valueLimitPolicy', 'spendingLimitsPolicy', 'timeFramePolicy', 'universalActionPolicy'].map((policy) => (
            <div key={policy} className="form-control">
              <label className="label cursor-pointer flex items-center">
                <input
                  type="checkbox"
                  checked={policyConfigs[policy as PolicyKey].active}
                  onChange={(e) => handlePolicyConfigChange(policy as PolicyKey, 'active', e.target.checked)}
                  className="checkbox mr-2"
                  disabled={policy === 'universalActionPolicy'}
                />
                <span className="label-text font-medium">{policyLabels[policy]}</span>
                {policy === 'valueLimitPolicy' && (
                  <div className="tooltip ml-2" data-tip={VALUE_LIMIT_TOOLTIP}>
                    <span className="text-base-content/60 cursor-help">ⓘ</span>
                  </div>
                )}
                {policy === 'spendingLimitsPolicy' && (
                  <div className="tooltip ml-2" data-tip={SPENDING_LIMITS_TOOLTIP}>
                    <span className="text-base-content/60 cursor-help">ⓘ</span>
                  </div>
                )}
                {policy === 'timeFramePolicy' && (
                  <div className="tooltip ml-2" data-tip={TIME_FRAME_TOOLTIP}>
                    <span className="text-base-content/60 cursor-help">ⓘ</span>
                  </div>
                )}
                {policy === 'universalActionPolicy' && (
                  <div className="tooltip ml-2" data-tip={UNIVERSAL_ACTION_TOOLTIP}>
                    <span className="text-base-content/60 cursor-help">ⓘ</span>
                  </div>
                )}
              </label>
              {policyConfigs[policy as PolicyKey].active && (
                <>
                  {policy === 'valueLimitPolicy' && (
                    <ValueLimitPolicy
                      valueLimit={policyConfigs.valueLimitPolicy.valueLimit}
                      onChange={(value) => handlePolicyConfigChange('valueLimitPolicy', 'valueLimit', value)}
                    />
                  )}
                  {policy === 'spendingLimitsPolicy' && (
                    <SpendingLimitsPolicy
                      value={policyConfigs.spendingLimitsPolicy.limit}
                      onChange={(value) => handlePolicyConfigChange('spendingLimitsPolicy', 'limit', value)}
                      safeAddress={safeAddress}
                      chainId={chainId}
                      onTokenSelect={(tokenAddress) => handlePolicyConfigChange('spendingLimitsPolicy', 'tokenAddress', tokenAddress)}
                      tokenPolicies={policyConfigs.spendingLimitsPolicy.tokenPolicies}
                      onAddTokenPolicy={(policy) => {
                        const updatedPolicies = [...policyConfigs.spendingLimitsPolicy.tokenPolicies, policy];
                        handlePolicyConfigChange('spendingLimitsPolicy', 'tokenPolicies', updatedPolicies);
                      }}
                      onRemoveTokenPolicy={(tokenAddress) => {
                        const updatedPolicies = policyConfigs.spendingLimitsPolicy.tokenPolicies.filter(
                          p => p.tokenAddress !== tokenAddress
                        );
                        handlePolicyConfigChange('spendingLimitsPolicy', 'tokenPolicies', updatedPolicies);
                      }}
                    />
                  )}
                  {policy === 'timeFramePolicy' && (
                    <TimeFramePolicy
                      startTime={policyConfigs.timeFramePolicy.startTime}
                      endTime={policyConfigs.timeFramePolicy.endTime}
                      onChange={(field, value) => handlePolicyConfigChange('timeFramePolicy', field, value)}
                    />
                  )}
                  {policy === 'universalActionPolicy' && (
                    <UniversalActionPolicy
                      usageCount={policyConfigs.universalActionPolicy.usageCount}
                      onChange={(value) => handlePolicyConfigChange('universalActionPolicy', 'usageCount', value)}
                      disabled={true}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PolicyConfiguration; 