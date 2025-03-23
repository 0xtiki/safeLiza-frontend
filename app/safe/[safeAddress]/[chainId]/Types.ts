import { Address, Hex } from "viem"

// Frontend types

export type InstalledModules = {
  ownableValidatorInstalled: boolean;
  webauthnValidatorInstalled: boolean;
  smartSessionsValidatorInstalled: boolean;
};

export type PolicyConfig = {
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

export type PolicyKey = keyof PolicyConfig;

export type TokenPolicy = {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  limit: number;
};

// Backend types
export type policyParams = SpendingLimits | ValueLimit | TimeFrame | UniversalAction | Sudo

export type Sudo = {
    policy: 'sudo'
    params: null
  }

export type SpendingLimits = {
  policy: 'spendingLimits'
  params: ParamsSpendingLimits
}

type ParamsSpendingLimits = {
  token: Address
  limit: string
}[]

export type ValueLimit = {
  policy: 'valueLimit'
  params: ParamsValueLimit
}

type ParamsValueLimit = {
  limit: string
}

export type TimeFrame = {
  policy: 'timeFrame'
  params: ParamsTimeFrame
}

type ParamsTimeFrame = {
  validUntil: number
  validAfter: number
}

export type UniversalAction = {
  policy: 'universalAction'
  params: ParamsUniversalAction
}

type ParamsUniversalAction = {
  policy: 'universalAction'
  actionPolicies: ActionConfig[]
}

enum ParamCondition {
  EQUAL = 0,
  GREATER_THAN = 1,
  LESS_THAN = 2,
  GREATER_THAN_OR_EQUAL = 3,
  LESS_THAN_OR_EQUAL = 4,
  NOT_EQUAL = 5,
  IN_RANGE = 6,
}

// LimitUsage struct
interface LimitUsage {
  limit: string // uint256 in Solidity
  used: string // uint256 in Solidity
}

// ParamRule struct
interface ParamRule {
  condition: ParamCondition
  offset: string
  isLimited: boolean
  ref: Hex
  usage: LimitUsage
}

// ParamRules struct with fixed length array
interface ParamRules {
  length: string
  rules: [
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
    ParamRule,
  ] // ParamRule[16] in Solidity
}

// ActionConfig struct
export interface ActionConfig {
  valueLimitPerUse: string // uint256 in Solidity
  paramRules: ParamRules
}