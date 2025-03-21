'use client';

// import ReactJson from 'react-json-view';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import dynamic from 'next/dynamic';
const ReactJsonView = dynamic(() => import('react-json-view'), { ssr: false });


type User = {
  id: string;
  username: string;
  safesByChain: Array<{
    chainId: number;
    safes: Array<{
      safeAddress: string;
      safeLegacyOwners: string[];
      safeModuleOwners?: string[];
      safeModulePasskey?: string;
    }>;
  }>;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);

          console.log('USER', userData);
        } else {
          console.error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  const safes = user.safesByChain || [];

  return (
    <AdminLayout>
    <div className="min-h-screen bg-base-300 p-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.username}!</h1>

      <h2 className="text-2xl font-bold mb-4">Your Safes</h2>

      {safes.map(({ chainId, safes }) => (
        <div key={chainId}>
          <h3 className="text-xl font-bold mb-2">Chain {chainId}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safes.map((safe, index) => (
              <div key={index} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h4 className="card-title">Safe {index + 1}</h4>
                  <ReactJsonView
                    src={{
                      ...safe,
                      safeModulePasskey: safe.safeModulePasskey
                        ? JSON.parse(safe.safeModulePasskey)
                        : undefined,
                    }}
                    theme="monokai"
                    style={{ backgroundColor: 'transparent' }}
                    collapsed={1}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard={false}
                    sortKeys
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    </AdminLayout>
  );
}
