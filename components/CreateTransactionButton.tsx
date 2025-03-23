import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SigningMethodModal from './SigningMethodModal';

// Dynamically import ReactJson
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

type UserOpReceipt = {
  transactionHash: string;
  userOpHash: string;
  success: boolean;
  // Add other properties that might be in the receipt
};

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

type Props = {
  safeAddress: string;
  chainId: number;
  passkeyId?: string;
  safeLegacyOwners: string[];
  safeModuleOwners?: string[];
};

export default function CreateTransactionButton({ safeAddress, chainId, passkeyId, safeLegacyOwners, safeModuleOwners }: Props) {
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [transactionData, setTransactionData] = useState<{
    userOperation: UserOperation;
    userOpHashToSign: string;
  } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserOpSigned, setIsUserOpSigned] = useState(false);
  const [signedUserOpReceipt, setSignedUserOpReceipt] = useState<UserOpReceipt | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a placeholder
  }

  const createTransaction = async () => {
    try {
      setIsCreatingTransaction(true);
      const calls = [
        {
          to: '0x6D7A849791a8E869892f11E01c2A5f3b25a497B6',
          functionName: 'greet',
          abi: [
            {
              inputs: [],
              name: 'greet', 
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
          args: [],
        },
      ];

      console.log('Creating transaction with passkeyId:', passkeyId);
      console.log('Safe address:', safeAddress);
      console.log('Chain ID:', chainId);
      console.log('Calls:', calls);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/safe/create-safe-passkey-user-operation`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: safeAddress, chainId, calls, passkeyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const data = await response.json();
      console.log('Transaction created:', data);
      const userOperation = JSON.parse(data.userOperation);
      setTransactionData({ userOperation, userOpHashToSign: data.userOpHashToSign });
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  const handleSignTransaction = () => {
    setIsModalOpen(true);
  };

  const handleSignSuccess = (receipt: UserOpReceipt) => {
    setIsUserOpSigned(true);
    setSignedUserOpReceipt(receipt);
  };

  return (
    <div>
      <button
        className="btn btn-primary btn-sm normal-case font-bold mt-4"
        onClick={createTransaction}
        disabled={isCreatingTransaction}
      >
        {isCreatingTransaction ? 'Creating User Op...' : 'Create User Op'}
      </button>

      {transactionData && (
        <div className="mt-4">
          <div className="collapse">
            <input
              type="checkbox"
              className="peer"
              checked={!isCollapsed}
              onChange={() => setIsCollapsed(!isCollapsed)}
            />
            <div className="collapse-title text-xl font-medium bg-base-300 rounded-box">
              Review Transaction Data
            </div>
            <div className="collapse-content bg-base-100 rounded-box">
              {isClient && (
                <ReactJson
                  src={transactionData.userOperation}
                  theme="bright:inverted"
                  style={{ 
                    backgroundColor: 'transparent',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                  collapsed={true}
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={false}
                  sortKeys
                />
              )}
            </div>
          </div>
          <p className="mt-2">User Op Hash to Sign: {transactionData.userOpHashToSign}</p>
          <button
            className="btn btn-secondary btn-sm normal-case font-bold mt-4"
            onClick={handleSignTransaction}
            disabled={isUserOpSigned}
          >
            Sign User Op
          </button>
        </div>
      )}

      {signedUserOpReceipt && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Receipt</h3>
          {isClient && (
            <ReactJson
              src={signedUserOpReceipt}
              theme="monokai"
              style={{ backgroundColor: 'transparent' }}
              collapsed={1}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              sortKeys
            />
          )}
        </div>
      )}

      <SigningMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        passkeyId={passkeyId}
        safeLegacyOwners={safeLegacyOwners}
        safeModuleOwners={safeModuleOwners}
        transactionData={transactionData}
        safeAddress={safeAddress}
        chainId={chainId}
        onSignSuccess={handleSignSuccess}
      />
    </div>
  );
} 