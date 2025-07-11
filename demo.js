import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function DeveloperDemo() {
  const { publicKey } = useWallet();
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testWallet, setTestWallet] = useState('');

  const callVerificationAPI = async (action) => {
    const walletToTest = testWallet || publicKey?.toString();
    
    if (!walletToTest) {
      alert('Please connect wallet or enter a test wallet address');
      return;
    }

    setLoading(true);
    setApiResponse(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletToTest,
          action: action
        })
      });

      const data = await response.json();
      setApiResponse({ status: response.status, data });
    } catch (error) {
      setApiResponse({ 
        status: 'ERROR', 
        data: { error: 'Network error', details: error.message } 
      });
    } finally {
      setLoading(false);
    }
  };

  const testAPIHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/verify');
      const data = await response.json();
      setApiResponse({ status: response.status, data });
    } catch (error) {
      setApiResponse({ 
        status: 'ERROR', 
        data: { error: 'Network error', details: error.message } 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="text-white text-2xl font-bold">LEV HOLDINGS - Developer Demo</div>
        <WalletMultiButton className="bg-purple-600 hover:bg-purple-700" />
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Verification API Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Test the LEV Holdings verification API - see how other apps can verify digital identities
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Left: API Testing */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🛠️ API Testing</h2>
            
            {/* Wallet Input */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Test Wallet Address
              </label>
              <input
                type="text"
                value={testWallet}
                onChange={(e) => setTestWallet(e.target.value)}
                placeholder={publicKey ? `Connected: ${publicKey.toString().slice(0, 8)}...` : "Enter wallet address to test"}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <p className="text-gray-400 text-xs mt-1">
                Leave empty to use connected wallet
              </p>
            </div>

            {/* API Actions */}
            <div className="space-y-3 mb-6">
              <button
                onClick={testAPIHealth}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test API Health'}
              </button>
              
              <button
                onClick={() => callVerificationAPI('check')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Credential Status'}
              </button>
              
              <button
                onClick={() => callVerificationAPI('verify')}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Full Credential Verification'}
              </button>
            </div>

            {/* API Endpoints */}
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">API Endpoints:</h3>
              <div className="text-sm space-y-1">
                <div className="text-green-400">GET /api/verify</div>
                <div className="text-blue-400">POST /api/verify</div>
                <div className="text-gray-300 text-xs ml-4">
                  {"{ walletAddress, action: 'check' | 'verify' }"}
                </div>
              </div>
            </div>
          </div>

          {/* Right: API Response */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">📊 API Response</h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-gray-300">Making API call...</p>
              </div>
            )}

            {apiResponse && !loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status Code:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    apiResponse.status === 200 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {apiResponse.status}
                  </span>
                </div>
                
                <div className="bg-black/50 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-green-400 text-sm">
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!apiResponse && !loading && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔌</div>
                <p className="text-gray-300">No API response yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Click a button above to test the API
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Integration Examples */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">🔗 Integration Examples</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* JavaScript Example */}
              <div>
                <h4 className="text-white font-bold mb-2">JavaScript Integration:</h4>
                <div className="bg-black/50 rounded-lg p-4 text-sm">
                  <pre className="text-green-400 overflow-x-auto">
{`// Check if wallet has credential
const response = await fetch('/api/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: userWallet,
    action: 'check'
  })
});

const result = await response.json();
if (result.hasCredential) {
  // User is verified
  allowAccess();
}`}
                  </pre>
                </div>
              </div>

              {/* cURL Example */}
              <div>
                <h4 className="text-white font-bold mb-2">cURL Example:</h4>
                <div className="bg-black/50 rounded-lg p-4 text-sm">
                  <pre className="text-blue-400 overflow-x-auto">
{`curl -X POST /api/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "walletAddress": "WALLET_ADDRESS",
    "action": "verify"
  }'`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🏦</div>
              <h4 className="text-white font-bold mb-2">DeFi Platforms</h4>
              <p className="text-gray-300 text-sm">
                Verify user identity for regulatory compliance and higher limits
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h4 className="text-white font-bold mb-2">Gaming & NFTs</h4>
              <p className="text-gray-300 text-sm">
                Prevent fraud and enable verified-only competitions
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">💼</div>
              <h4 className="text-white font-bold mb-2">Enterprise</h4>
              <p className="text-gray-300 text-sm">
                Corporate access control and employee verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
      