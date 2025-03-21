'use client';

import { WebAuthnP256 } from 'ox';
import { useState } from 'react';
import { Hex } from 'viem';
import base64url from 'base64url';
import { PublicKey } from 'ox';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

// type LoginResult = {
//   safes: Record<string, {
//     safeAddress: string;
//     safeLegacyOwners: string[];
//     safeModuleOwners: string[];
//     safeModulePasskey?: string;
//   }>;
// };

export default function Login() {
  // const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [username, setUsername] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const router = useRouter();

  const handlePasskeyLogin = async () => {
    try {
      // First get challenge from server
      const challengeResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/passkey/challenge`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const { challenge } = await challengeResponse.json();

      const decodedChallenge = base64url.decode(challenge, 'hex') as Hex;

      const { metadata, raw } = await WebAuthnP256.sign({
        challenge: `0x${decodedChallenge}`
      });


      const body = {
        id: raw.id,
        response: {
            clientDataJSON: base64url.encode(
                metadata.clientDataJSON
            ),
            authenticatorData: base64url.encode(
              Buffer.from(metadata.authenticatorData.replace(/^0x/, ''), 'hex')
            ),
            signature: base64url.encode(
              // @ts-expect-error signature exists
              raw.response.signature
            ),
            // @ts-expect-error userHandle exists
            userHandle: raw.response.userHandle
        },
    }

      // Send signature back for verification
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/passkey/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to login with passkey');
      }

      // const data = await response.json();
      // setLoginResult(data);
      
      // Ensure the response is successful before redirecting
      console.log('Redirecting to dashboard');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error logging in with passkey:', error);
    }
  };

  const handlePasskeySignup = async () => {
    try {
      // Step 1: Request a challenge from the server
      const challengeResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/passkey/challenge`, 
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username
          }),
        }
      );
      const { user, challenge } = await challengeResponse.json();
      const decodedChallenge = base64url.decode(challenge, 'hex');
      const bufferChallengeHex = Buffer.from(decodedChallenge, 'hex');
      const arrayBufferChallenge = bufferChallengeHex.buffer.slice(
        bufferChallengeHex.byteOffset,
        bufferChallengeHex.byteOffset + bufferChallengeHex.byteLength
      );

      console.log('decodedChallenge:', decodedChallenge);

      const credential = await WebAuthnP256.createCredential({ 
        name: username || base64url.decode(user.id),
        challenge: arrayBufferChallenge,
      });

      console.log('credential:', credential);

      // Create a TextDecoder instance
      const decoder = new TextDecoder('utf-8');

      // Decode the Uint8Array to a string
      const strClientDataJSON = decoder.decode(credential.raw.response.clientDataJSON);

      console.log(strClientDataJSON);

      const publicKey = PublicKey.from(credential.publicKey);

      console.log('PUBLIC KEY', publicKey);

      // Step 3: Send the signed challenge to the verify endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/passkey/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: {
              clientDataJSON: base64url.encode(
                strClientDataJSON
              ),
              attestationObject: base64url.encode(
                Buffer.from((credential.raw.response as AuthenticatorAttestationResponse).attestationObject)
              ),
          },
          publicKeyHex: PublicKey.toHex(publicKey)
        }),
      });

      console.log('response:', response);

      if (!response.ok) {
        console.error('Failed to sign up with passkey');
      }

      alert('Passkey signup successful!');
      // hide signup form
      setShowSignup(false);
    } catch (error) {
      console.error('Error signing up with passkey:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-center justify-center bg-base-300">
        <div className="card w-[400px] bg-base-100 shadow-2xl">
          <div className="card-body">
          <h1 className="text-3xl font-bold text-center mb-8">Login to Safe</h1>
          
          <div className="flex flex-col gap-4">
            <button 
              className="btn btn-primary btn-lg normal-case font-bold"
              onClick={handlePasskeyLogin}
            >
              Login with Passkey
            </button>

            <div className="text-center">
              <a 
                href="#" 
                className="link link-hover"
                onClick={() => setShowSignup(true)}
              >
                Don&apos;t have an account? Sign up
              </a>
            </div>

            {showSignup && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    className="input input-bordered"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <button 
                  className="btn btn-secondary btn-lg normal-case font-bold"
                  onClick={handlePasskeySignup}
                >
                  Sign up with Passkey
                </button>
              </>
            )}
          </div>

          {/* {loginResult && (
            <div className="mt-8 pt-8 border-t border-base-300">
              <h2 className="text-xl font-bold mb-4">Your Safes</h2>
              <div className="bg-base-200 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(loginResult, null, 2)}
                </pre>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>  
    </AdminLayout>
  );
} 