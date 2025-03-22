'use client';

// import ReactJson from 'react-json-view';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
const ReactJsonView = dynamic(() => import('react-json-view'), { ssr: false });

type Safe = {
  safeAddress: string;
  safeLegacyOwners: string[];
  safeModuleOwners?: string[];
  safeModulePasskey?: string;
  safeModuleSessionConfig?: string[];
}

type User = {
  id: string;
  username: string;
  safesByChain: Array<{
    chainId: number;
    safes: Array<Safe>;
  }>;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);

        //   console.log('USER', userData);
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

  const handleEditSafe = (safeConfig: Safe, chainId: number) => {
    router.push(`/safe/${safeConfig.safeAddress}/${chainId}`);
  };

  return (
    <AdminLayout>
    <div className="min-h-screen bg-base-300 p-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.username}!</h1>

      <h2 className="text-2xl font-bold mb-4">Your Safes</h2>

      <div className="grid grid-cols-1 gap-8">
        {safes.map(({ chainId, safes }) => (
          <div key={chainId}>
            <div className="card bg-base-100 shadow-xl cursor-pointer">
              <h3 className="text-xl font-bold mb-2 p-4">Chain {chainId}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {safes.map((safe, index) => (
                  <div key={index} className="card bg-base-100 shadow-xl p-4 mb-4 ml-4">
                    <div className="card-body">
                      <div className="card-actions justify-start">
                        <h4 className="card-title text-center mb-4">Safe {index + 1}</h4>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditSafe(safe, chainId)}
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex justify-start items-center">
                        <ReactJsonView
                          src={{
                            ...safe,
                            safeModulePasskey: safe.safeModulePasskey
                              ? JSON.parse(safe.safeModulePasskey)
                              : undefined,
                          }}
                          name="Configuration"
                          theme="bright:inverted"
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-4"></div>
          </div>
        ))}
        <Link href="/create">
          <div key="add" className="card bg-secondary text-secondary-content shadow-xl cursor-pointer h-20">
            <div className="card-body flex justify-center items-center">
              <h4 className="card-title text-4xl">+</h4>
            </div>
          </div>
        </Link>
      </div>
    </div>
    </AdminLayout>
  );
}
