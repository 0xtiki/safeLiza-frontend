'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import PolicyConfiguration from '@/components/policies/PolicyConfiguration';

type InstalledModules = {
  ownableValidatorInstalled: boolean;
  webauthnValidatorInstalled: boolean;
  smartSessionsValidatorInstalled: boolean;
};

type PolicyConfig = {
  spendingLimitsPolicy: { limit: number; active: boolean };
  timeFramePolicy: { startTime: string; endTime: string; active: boolean };
  usageLimitPolicy: { usageCount: number; active: boolean };
  valueLimitPolicy: { valueLimit: number; active: boolean };
  sudoPolicy: { active: boolean };
};

type PolicyKey = keyof PolicyConfig;

export default function SafePage() {
  const params = useParams();
  const [safeAddress, setSafeAddress] = useState('');
  const [chainId, setChainId] = useState(0);
  const [installedModules, setInstalledModules] = useState<InstalledModules | null>(null);
  const [policyConfigs, setPolicyConfigs] = useState<PolicyConfig>({
    spendingLimitsPolicy: { limit: 0, active: false },
    timeFramePolicy: { startTime: '', endTime: '', active: false },
    usageLimitPolicy: { usageCount: 0, active: false },
    valueLimitPolicy: { valueLimit: 0, active: false },
    sudoPolicy: { active: false },
  });
  const [selectedStrategy, setSelectedStrategy] = useState<string>('AI-DCA');

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

  const handlePolicyConfigChange = (policy: PolicyKey, field: string, value: string | number | boolean) => {
    setPolicyConfigs((prevConfigs) => ({
      ...prevConfigs,
      [policy]: {
        ...prevConfigs[policy],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/safe/configure-smart-session`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          safeAddress,
          chainId,
          policyConfigs,
          strategy: selectedStrategy,
        }),
      });

      if (response.ok) {
        console.log('Smart session configured successfully');
      } else {
        console.error('Failed to configure smart session');
      }
    } catch (error) {
      console.error('Error configuring smart session:', error);
    }
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
              />
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Configure Smart Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 