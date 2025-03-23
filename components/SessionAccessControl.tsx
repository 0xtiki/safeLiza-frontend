import { useState } from 'react';

type SessionAccessControlProps = {
  sessionId: string;
  safeAddress: string;
  chainId: number;
  initialActive: boolean;
  url: string;
  onToggleSuccess: () => void;
};

export default function SessionAccessControl({
//   sessionId,
  safeAddress,
  chainId,
  initialActive,
  url,
  onToggleSuccess
}: SessionAccessControlProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleToggleAccess = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/safe/activate-endpoint`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: url,
          safeAddress: safeAddress,
          chainId: chainId,
          active: !isActive,
        //   sessionId: sessionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update session access');
      }
      
      setIsActive(!isActive);
      onToggleSuccess();
    } catch (error) {
      console.error('Error toggling session access:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4">
      <div className="form-control">
        <label className="cursor-pointer label justify-start">
          <input
            type="checkbox"
            className="checkbox checkbox-primary mr-2"
            checked={isActive}
            onChange={handleToggleAccess}
            disabled={isLoading}
          />
          <span className="label-text font-medium">
            {isLoading ? 'Updating...' : 'Grant API Access'}
          </span>
        </label>
      </div>
      
      {isActive && url && (
        <div className="mt-2 p-3 bg-success bg-opacity-10 rounded-md">
          <p className="text-sm font-medium">API Endpoint:</p>
          <code className="block mt-1 text-xs bg-base-300 p-2 rounded overflow-x-auto">
            {url}
          </code>
        </div>
      )}
    </div>
  );
} 