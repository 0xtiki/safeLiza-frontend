import { useState } from 'react';
import { getWebauthnValidatorSignature } from '@rhinestone/module-sdk';
import { sign } from 'ox/WebAuthnP256';

// Define a type for the user operation
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
  // Add other properties that might be in the receipt
};

type SigningMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  passkeyId?: string;
  safeLegacyOwners: string[];
  safeModuleOwners?: string[];
  transactionData: {
    userOperation: UserOperation;
    userOpHashToSign: string;
  } | null;
  safeAddress: string;
  chainId: number;
  onSignSuccess: (receipt: UserOpReceipt) => void;
  onSignWithPasskey?: (
    passkeyId: string | undefined,
    transactionData: { userOperation: UserOperation; userOpHashToSign: string } | null,
    safeAddress: string,
    chainId: number
  ) => Promise<UserOpReceipt>;
};

export default function SigningMethodModal({
  isOpen,
  onClose,
  passkeyId,
  safeLegacyOwners,
  safeModuleOwners,
  transactionData,
  safeAddress,
  chainId,
  onSignSuccess,
  onSignWithPasskey: customSignWithPasskey
}: SigningMethodModalProps) {
  const [isExecutingUserOp, setIsExecutingUserOp] = useState(false);

  // Default implementation
  const defaultSignWithPasskey = async (
    passkeyId: string | undefined,
    transactionData: { userOperation: UserOperation; userOpHashToSign: string } | null,
    safeAddress: string,
    chainId: number
  ): Promise<UserOpReceipt> => {
    const { metadata: webauthn, signature } = await sign({
      credentialId: passkeyId,
      challenge: transactionData?.userOpHashToSign as `0x${string}`,
    });
    console.log('Signing with passkey');
    console.log('Webauthn:', webauthn);
    console.log('Signature:', signature);

    const encodedSignature = getWebauthnValidatorSignature({
      webauthn,
      signature,
      usePrecompiled: false,
    });

    console.log('Transaction data:', transactionData);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/safe/execute-signed-passkey-user-operation`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ encodedSignature, userOpHashToSign: transactionData?.userOpHashToSign, safeAddress, chainId }),
    });

    if (!response.ok) {
      throw new Error('Failed to execute user op');
    }

    const data = await response.json();
    console.log('User op executed:', data);
    return data;
  };

  // Use the provided handler or fall back to the default
  const signWithPasskey = customSignWithPasskey || defaultSignWithPasskey;

  const handleSignWithPasskey = async () => {
    try {
      setIsExecutingUserOp(true);
      const receipt = await signWithPasskey(passkeyId, transactionData, safeAddress, chainId);
      onSignSuccess(receipt);
      onClose();
    } catch (error) {
      console.error('Error signing with passkey:', error);
    } finally {
      setIsExecutingUserOp(false);
    }
  };

  const handleSignWithLegacyOwner = async (ownerAddress: string) => {
    try {
      // TODO: Implement signing with legacy owner
      console.log('Signing with legacy owner:', ownerAddress);
    } catch (error) {
      console.error('Error signing with legacy owner:', error);
    }
  };

  const handleSignWithModuleOwner = async (ownerAddress: string) => {
    try {
      // TODO: Implement signing with module owner
      console.log('Signing with module owner:', ownerAddress);
    } catch (error) {
      console.error('Error signing with module owner:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Select Signing Method</h3>
        {passkeyId && (
          <div className="mt-4">
            <button
              className="btn btn-primary btn-sm normal-case font-bold"
              onClick={handleSignWithPasskey}
              disabled={isExecutingUserOp}
            >
              {isExecutingUserOp ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Sign with Passkey'
              )}
            </button>
          </div>
        )}
        {safeLegacyOwners.length > 0 && (
          <div className="mt-4">
            {/* <h4 className="font-bold">Legacy Owners</h4> */}
            {safeLegacyOwners
              .filter((ownerAddress) => ownerAddress !== '0x5380c7b7Ae81A58eb98D9c78de4a1FD7fd9535FC')
              .map((ownerAddress) => (
                <div key={ownerAddress} className="mt-2">
                  <button
                    className="btn btn-primary btn-sm normal-case font-bold"
                    onClick={() => handleSignWithLegacyOwner(ownerAddress)}
                  >
                    Sign with {ownerAddress}
                  </button>
                </div>
              ))
            }
          </div>
        )}
        {safeModuleOwners && safeModuleOwners.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold">Module Owners</h4>
            {safeModuleOwners.map((ownerAddress) => (
              <div key={ownerAddress} className="mt-2">
                <button
                  className="btn btn-primary btn-sm normal-case font-bold"
                  onClick={() => handleSignWithModuleOwner(ownerAddress)}
                >
                  Sign with {ownerAddress}
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 