import React, { useState } from 'react';
import SpendingLimitsPolicy from './SpendingLimitsPolicy';
import TimeFramePolicy from './TimeFramePolicy';
import UsageLimitPolicy from './UsageLimitPolicy';
import ValueLimitPolicy from './ValueLimitPolicy';
import SudoPolicy from './SudoPolicy';

type PolicyConfig = {
  spendingLimitsPolicy: { limit: number; active: boolean };
  timeFramePolicy: { startTime: string; endTime: string; active: boolean };
  usageLimitPolicy: { usageCount: number; active: boolean };
  valueLimitPolicy: { valueLimit: number; active: boolean };
  sudoPolicy: { active: boolean };
};

type PolicyKey = keyof PolicyConfig;

type Props = {
  policyConfigs: PolicyConfig;
  handlePolicyConfigChange: (policy: PolicyKey, field: string, value: string | number | boolean) => void;
};

const PolicyConfiguration: React.FC<Props> = ({ policyConfigs, handlePolicyConfigChange }) => {
  const [isSudoPolicySelected, setIsSudoPolicySelected] = useState(false);

  const handleSudoPolicyChange = (value: boolean) => {
    setIsSudoPolicySelected(value);
    handlePolicyConfigChange('sudoPolicy', 'active', value);
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
          <span className="label-text">sudoPolicy</span>
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
          {['spendingLimitsPolicy', 'timeFramePolicy', 'usageLimitPolicy', 'valueLimitPolicy'].map((policy) => (
            <div key={policy} className="form-control">
              <label className="label cursor-pointer flex items-center">
                <input
                  type="checkbox"
                  checked={policyConfigs[policy as PolicyKey].active}
                  onChange={(e) => handlePolicyConfigChange(policy as PolicyKey, 'active', e.target.checked)}
                  className="checkbox mr-2"
                />
                <span className="label-text">{policy}</span>
              </label>
              {policyConfigs[policy as PolicyKey].active && (
                <>
                  {policy === 'spendingLimitsPolicy' && (
                    <SpendingLimitsPolicy
                      value={policyConfigs.spendingLimitsPolicy.limit}
                      // active={policyConfigs.spendingLimitsPolicy.active}
                      onChange={(value) => handlePolicyConfigChange('spendingLimitsPolicy', 'limit', value)}
                    />
                  )}
                  {policy === 'timeFramePolicy' && (
                    <TimeFramePolicy
                      startTime={policyConfigs.timeFramePolicy.startTime}
                      endTime={policyConfigs.timeFramePolicy.endTime}
                      onChange={(field, value) => handlePolicyConfigChange('timeFramePolicy', field, value)}
                    />
                  )}
                  {policy === 'usageLimitPolicy' && (
                    <UsageLimitPolicy
                      usageCount={policyConfigs.usageLimitPolicy.usageCount}
                      onChange={(value) => handlePolicyConfigChange('usageLimitPolicy', 'usageCount', value)}
                    />
                  )}
                  {policy === 'valueLimitPolicy' && (
                    <ValueLimitPolicy
                      valueLimit={policyConfigs.valueLimitPolicy.valueLimit}
                      onChange={(value) => handlePolicyConfigChange('valueLimitPolicy', 'valueLimit', value)}
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