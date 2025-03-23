import { useState, useEffect, useCallback } from 'react';

type SafeSessionConfig = {
  sessionKey: string;
  permissionEnableHash: string;
  permissionId: string;
  sessionDetails: string;
  endpoint: {
    active: boolean;
    url: string;
  };
};

export function useSessionDetails(safeAddress: string, chainId: number) {
  const [sessionConfigs, setSessionConfigs] = useState<SafeSessionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the fetch function with useCallback
  const fetchSessionDetails = useCallback(async () => {
    if (!safeAddress || !chainId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/safe/get-session-details/${safeAddress}/${chainId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }

      const data = await response.json();
      setSessionConfigs(data); // Now expecting an array
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [safeAddress, chainId]);

  // Now include fetchSessionDetails in the dependency array
  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  return {
    sessionConfigs, // Return the array instead of a single config
    loading,
    error,
    refreshSessionDetails: fetchSessionDetails,
  };
} 