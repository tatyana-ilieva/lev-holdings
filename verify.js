// Next.js API route - /api/verify.js
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { walletAddress, action } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ 
          error: 'Wallet address is required',
          code: 'MISSING_WALLET'
        });
      }

      // Validate wallet address format
      try {
        new PublicKey(walletAddress);
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid wallet address format',
          code: 'INVALID_WALLET'
        });
      }

      switch (action) {
        case 'verify':
          return await verifyCredential(req, res, walletAddress);
        case 'check':
          return await checkCredential(req, res, walletAddress);
        default:
          return res.status(400).json({ 
            error: 'Invalid action. Use "verify" or "check"',
            code: 'INVALID_ACTION'
          });
      }
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  if (req.method === 'GET') {
    // Health check endpoint
    return res.status(200).json({ 
      status: 'active',
      service: 'LEV Holdings Verification API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({ 
    error: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED'
  });
}

async function verifyCredential(req, res, walletAddress) {
  try {
    // In a real application, this would:
    // 1. Connect to Solana blockchain
    // 2. Query the wallet for LEV Holdings NFTs
    // 3. Verify the NFT metadata and authenticity
    // 4. Check if the credential is still valid
    
    // For demo purposes, we'll simulate this process
    console.log(`Verifying credential for wallet: ${walletAddress}`);
    
    // Simulate blockchain query delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock credential verification
    const mockCredential = {
      walletAddress: walletAddress,
      credentialId: `LEV_${Date.now()}`,
      issuer: 'LEV Holdings',
      issuedAt: new Date().toISOString(),
      status: 'VERIFIED',
      credentialType: 'Digital Identity',
      verificationLevel: 'KYC_COMPLETE',
      attributes: {
        hasKYC: true,
        verificationTier: 'STANDARD',
        lastVerified: new Date().toISOString()
      }
    };

    // Simulate random verification outcomes for demo
    const isValid = Math.random() > 0.2; // 80% success rate for demo
    
    if (isValid) {
      return res.status(200).json({
        success: true,
        verified: true,
        credential: mockCredential,
        message: 'Credential verified successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(200).json({
        success: true,
        verified: false,
        message: 'No valid credential found for this wallet',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification failed',
      code: 'VERIFICATION_ERROR'
    });
  }
}

async function checkCredential(req, res, walletAddress) {
  try {
    // Quick check for credential existence
    console.log(`Checking credential status for wallet: ${walletAddress}`);
    
    // Simulate quick blockchain lookup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hasCredential = Math.random() > 0.3; // 70% have credentials for demo
    
    return res.status(200).json({
      success: true,
      walletAddress: walletAddress,
      hasCredential: hasCredential,
      credentialType: hasCredential ? 'Digital Identity' : null,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Check failed',
      code: 'CHECK_ERROR'
    });
  }
}