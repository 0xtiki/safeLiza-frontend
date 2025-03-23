import { Address, parseEther } from 'viem';
import { PolicyConfig, SpendingLimits, ValueLimit, TimeFrame, Sudo, policyParams } from './Types';
import { parseUnits } from 'viem'

type PartialActions = {
    actionTarget: Address;
    actionTargetSelector: string;
}

export function convertPolicyConfigToBackendFormat(policyConfigs: PolicyConfig): { policies: policyParams[], actions: PartialActions[] } {
  const policies: policyParams[] = [];
  const actions: PartialActions[] = [];

  // Add Sudo policy if active
  if (policyConfigs.sudoPolicy.active) {
    const sudoPolicy: Sudo = {
      policy: 'sudo',
      params: null
    };
    policies.push(sudoPolicy);
    return { policies, actions: [] }; // If sudo is active, we don't need other policies
  }

  // Add SpendingLimits policy if active
  if (policyConfigs.spendingLimitsPolicy.active && policyConfigs.spendingLimitsPolicy.tokenPolicies.length > 0) {
    const spendingLimitsParams = policyConfigs.spendingLimitsPolicy.tokenPolicies.map(policy => ({
      token: policy.tokenAddress as Address,
      limit: parseUnits(policy.limit.toString(), parseInt(policy.tokenDecimals)).toString()
    }));

    const spendingLimitsActions: PartialActions[] = [];

    for (const policy of policyConfigs.spendingLimitsPolicy.tokenPolicies) {
        spendingLimitsActions.push({
            actionTarget: policy.tokenAddress as Address,
            actionTargetSelector: "0xa9059cbb" // transfer function selector
        })

        spendingLimitsActions.push({
            actionTarget: policy.tokenAddress as Address,
            actionTargetSelector: "0x23b872dd" // transferFrom function selector
        })

        spendingLimitsActions.push({
            actionTarget: policy.tokenAddress as Address,
            actionTargetSelector: "0x70a08231" // balanceOf function selector
        })
    }

    const spendingLimitsPolicy: SpendingLimits = {
      policy: 'spendingLimits',
      params: spendingLimitsParams
    };

    policies.push(spendingLimitsPolicy);
    actions.push(...spendingLimitsActions);
  }

  // Add ValueLimit policy if active
  if (policyConfigs.valueLimitPolicy.active) {
    const valueLimitPolicy: ValueLimit = {
      policy: 'valueLimit',
      params: {
        limit: parseEther(policyConfigs.valueLimitPolicy.valueLimit.toString()).toString()
      }
    };
    policies.push(valueLimitPolicy);
  } 

  // Add TimeFrame policy if active
  if (policyConfigs.timeFramePolicy.active) {
    const startTime = new Date(policyConfigs.timeFramePolicy.startTime).getTime() / 1000;
    const endTime = new Date(policyConfigs.timeFramePolicy.endTime).getTime() / 1000;
    
    const timeFramePolicy: TimeFrame = {
      policy: 'timeFrame',
      params: {
        validAfter: Math.floor(startTime),
        validUntil: Math.floor(endTime)
      }
    };
    policies.push(timeFramePolicy);
  }

  // Add UniversalAction policy if active (for usageLimitPolicy)
  // This is more complex and would need specific implementation based on requirements

  return { policies, actions };
} 