'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import PolicyConfiguration from '@/components/policies/PolicyConfiguration';
import SigningMethodModal from '@/components/SigningMethodModal';
import { convertPolicyConfigToBackendFormat } from './utils';
import { InstalledModules, PolicyConfig, PolicyKey, TokenPolicy } from './Types';
import { Hex } from 'viem';
import { sign } from 'ox/WebAuthnP256';
import { getWebauthnValidatorSignature } from '@rhinestone/module-sdk';
import { useSessionDetails } from '@/app/hooks/useSessionDetails';
import dynamic from 'next/dynamic';
import AddressCopy from '@/components/AddressCopy';
import SessionAccessControl from '@/components/SessionAccessControl';

// Dynamically import ReactJson
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

// Define types needed for the modal
type UserOperation = {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
};

type UserOpReceipt = {
  transactionHash: string;
  userOpHash: string;
  success: boolean;
};

export default function SafePage() {
  const params = useParams();
  const [safeAddress, setSafeAddress] = useState('');
  const [chainId, setChainId] = useState(0);
  const [installedModules, setInstalledModules] = useState<InstalledModules | null>(null);
  const [policyConfigs, setPolicyConfigs] = useState<PolicyConfig>({
    spendingLimitsPolicy: { 
      limit: 0, 
      active: false, 
      tokenAddress: '',
      tokenPolicies: []
    },
    timeFramePolicy: { startTime: '', endTime: '', active: false },
    universalActionPolicy: { usageCount: 0, active: false },
    valueLimitPolicy: { valueLimit: 0, active: false },
    sudoPolicy: { active: false },
  });
  const [selectedStrategy, setSelectedStrategy] = useState<string>('AI-DCA');
  const [smartSession, setSmartSession] = useState<Record<Hex, { hash: string, passkeyId: string }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signedReceipt, setSignedReceipt] = useState<UserOpReceipt | null>(null);
  
  // Get session details using our new hook
  const { sessionConfigs, refreshSessionDetails } = useSessionDetails(safeAddress, chainId);
  
  // Get the passkey ID from the smart session
  const passkeyId = smartSession && safeAddress ? smartSession[safeAddress as Hex]?.passkeyId : undefined;
  
  // Transaction data for the modal
  const [transactionData, setTransactionData] = useState<{
    userOperation: UserOperation;
    userOpHashToSign: string;
  } | null>(null);

  useEffect(() => {
    const fetchInstalledModules = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/safe/installed-modules`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ safeAddress, chainId }),
        });

        if (response.ok) {
          const data = await response.json();
          setInstalledModules(data);
        } else {
          console.error('Failed to fetch installed modules');
        }
      } catch (error) {
        console.error('Error fetching installed modules:', error);
      }
    };

    if (safeAddress && chainId) {
      fetchInstalledModules();
    }
  }, [safeAddress, chainId]);

  useEffect(() => {
    const { safeAddress, chainId } = params;
    if (safeAddress && chainId) {
      setSafeAddress(safeAddress as string);
      setChainId(parseInt(chainId as string, 10));
    }
  }, [params]);

  const handlePolicyConfigChange = (
    policy: PolicyKey, 
    field: string, 
    value: string | number | boolean | Array<TokenPolicy>
  ) => {
    setPolicyConfigs((prevConfigs) => ({
      ...prevConfigs,
      [policy]: {
        ...prevConfigs[policy],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { policies, actions} = convertPolicyConfigToBackendFormat(policyConfigs);

      const data = {
        safeAddress,
        chainId,
        sessionConfigDto: {
          userOpPolicies: policies,
          erc7739Policies: {
            allowedERC7739Content: [],
            erc1271Policies: [],
          },
          actions: actions,
        },
        // strategy: selectedStrategy,
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/safe/configure-smart-session`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Smart session configured successfully');
        // save the return data to state. 
        const data = await response.json();
        setSmartSession({[safeAddress]: {... data}});
      } else {
        console.error('Failed to configure smart session');
      }
    } catch (error) {
      console.error('Error configuring smart session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!smartSession || !safeAddress) return;

    const sessionData = smartSession[safeAddress as Hex];
    const { hash } = sessionData;
    
    // Set up transaction data for the modal
    setTransactionData({
      userOperation: {
        sender: safeAddress,
        nonce: '0x0',
        initCode: '0x',
        callData: '0x',
        callGasLimit: '0x0',
        verificationGasLimit: '0x0',
        preVerificationGas: '0x0',
        maxFeePerGas: '0x0',
        maxPriorityFeePerGas: '0x0',
        paymasterAndData: '0x',
        signature: '0x'
      },
      userOpHashToSign: hash
    });
    
    // Open the modal
    setIsModalOpen(true);
  };
  
  // Custom signWithPasskey implementation for the modal
  const customSignWithPasskey = async (
    passkeyId: string | undefined,
    transactionData: { userOperation: UserOperation; userOpHashToSign: string } | null,
    safeAddress: string,
    chainId: number
  ): Promise<UserOpReceipt> => {
    if (!passkeyId || !transactionData) {
      throw new Error('Missing required parameters');
    }
    
    const { metadata: webauthn, signature } = await sign({
      credentialId: passkeyId,
      challenge: transactionData.userOpHashToSign as `0x${string}`,
    });
    
    const encodedSignature = getWebauthnValidatorSignature({
      webauthn,
      signature,
      usePrecompiled: false,
    });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/safe/sign-session-creation`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hash: transactionData.userOpHashToSign,
        safeAddress,
        chainId,
        encodedSignature,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sign session creation');
    }
    
    const data = await response.json();
    console.log('Session creation signed successfully', data);
    
    // Return a receipt-like object
    return {
      transactionHash: data.transactionHash || '0x',
      userOpHash: transactionData.userOpHashToSign,
      success: true
    };
  };
  
  const handleSignSuccess = (receipt: UserOpReceipt) => {
    setSignedReceipt(receipt);
    console.log('Session successfully signed:', receipt);
    
    // Reset smartSession to show Configure button again
    setSmartSession(null);
    
    // Refresh session details to show the new configuration
    refreshSessionDetails();
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-base-300 p-8">
        <h1 className="text-3xl font-bold mb-8">Safe Address: {safeAddress}</h1>

        <h2 className="text-2xl font-bold mb-4">Installed Modules</h2>

        {installedModules ? (
          <div>
            <p>Ownable Validator: {installedModules.ownableValidatorInstalled ? 'Installed' : 'Not Installed'}</p>
            <p>WebAuthn Validator: {installedModules.webauthnValidatorInstalled ? 'Installed' : 'Not Installed'}</p>
            <p>Smart Sessions Validator: {installedModules.smartSessionsValidatorInstalled ? 'Installed' : 'Not Installed'}</p>
          </div>
        ) : (
          <p>Loading installed modules...</p>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Trading Strategies</h2>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Select Trading Strategy</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
            >
              <option value="AI-DCA">AI-DCA</option>
              <option value="AI-Trader">AI-Trader</option>
              <option value="External">External (export key)</option>
            </select>
          </div>

          <h2 className="text-2xl font-bold mb-4">Configure Smart Session</h2>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <PolicyConfiguration
                policyConfigs={policyConfigs}
                handlePolicyConfigChange={handlePolicyConfigChange}
                safeAddress={safeAddress}
                chainId={chainId}
              />
              <div className="card-actions justify-end">
                {smartSession ? (
                  <button className="btn btn-secondary" onClick={handleApprove} disabled={loading}>
                    {loading ? 'Approving...' : 'Approve'}
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Configuring...' : 'Configure Smart Session'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Display session details */}
          {sessionConfigs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Active Session Configurations</h3>
              
              {sessionConfigs.map((config, index) => {
                // Get the active state directly from the config
                const isEndpointActive = config.endpoint?.active || false;
                
                return (
                  <div 
                    key={config.permissionId || index} 
                    className={`p-4 rounded-box mb-4 ${
                      isEndpointActive ? 'bg-success bg-opacity-20' : 'bg-base-200'
                    }`}
                  >
                    <AddressCopy value={config.sessionKey} label="Session Key" />
                    <AddressCopy value={config.permissionId} label="Permission ID" />
                    <AddressCopy value={config.permissionEnableHash} label="Permission Enable Hash" />
                    
                    <div className="mt-4">
                      <h4 className="font-bold">Session Details:</h4>
                      {config.sessionDetails && (
                        <ReactJson
                          src={JSON.parse(config.sessionDetails)}
                          theme="bright:inverted"
                          name="Configuration"
                          style={{ 
                            backgroundColor: 'transparent',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxWidth: '100%',
                          }}
                          collapsed={true}
                          displayDataTypes={false}
                          displayObjectSize={false}
                          enableClipboard={false}
                          sortKeys
                        />
                      )}
                    </div>
                    
                    <SessionAccessControl
                      sessionId={config.permissionId}
                      safeAddress={safeAddress}
                      chainId={chainId}
                      initialActive={isEndpointActive}
                      url={config.endpoint?.url || ''}
                      onToggleSuccess={refreshSessionDetails}
                    />
                  </div>
                );
              })}
            </div>
          )}
          
          {sessionConfigs.length === 0 && !loading && (
            <div className="mt-6 p-4 bg-base-200 rounded-box">
              <p>No active session configurations found.</p>
            </div>
          )}
          
          {signedReceipt && (
            <div className="mt-4 p-4 bg-success text-success-content rounded-box">
              <h3 className="font-bold">Session Successfully Signed!</h3>
              <p>Transaction Hash: {signedReceipt.transactionHash}</p>
              <p>User Op Hash: {signedReceipt.userOpHash}</p>
            </div>
          )}
        </div>
        
        {/* Add the SigningMethodModal */}
        <SigningMethodModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          passkeyId={passkeyId}
          safeLegacyOwners={[]} // Pass any legacy owners if needed
          safeModuleOwners={[]} // Pass any module owners if needed
          transactionData={transactionData}
          safeAddress={safeAddress}
          chainId={chainId}
          onSignSuccess={handleSignSuccess}
          onSignWithPasskey={customSignWithPasskey}
        />
      </div>
    </AdminLayout>
  );
} 