// pages/api/verify-credential.js - FIXED VERSION
export default async function handler(req, res) {
  const { wallet } = req.query;

  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  try {
    console.log('🔍 Verifying credential for wallet:', wallet);

    // Check if this wallet actually completed KYC
    // Only return verified=true if they really did the process
    const hasRealCredential = checkForRealCredential(wallet);
    
    if (hasRealCredential) {
      const verificationData = {
        verified: true,
        walletAddress: wallet,
        credentialId: `LEV_${wallet.slice(0, 8)}`,
        issuedAt: new Date().toISOString(),
        complianceScore: Math.floor(Math.random() * 50) + 950,
        status: 'active',
        issuer: 'LEV Holdings',
        verificationLevel: 'Enterprise KYC',
        attributes: {
          country: 'US',
          ageVerified: true,
          documentType: 'government_id',
          livenessCheck: true,
          amlScreening: true,
          verificationMethod: 'sumsub'
        }
      };

      console.log('✅ Real credential found and verified');
      return res.status(200).json(verificationData);
    }

    // Default: No credential found
    console.log('❌ No credential found for wallet:', wallet);
    return res.status(404).json({
      verified: false,
      walletAddress: wallet,
      message: 'No verified credential found for this wallet address',
      suggestion: 'Complete KYC verification to obtain a digital identity credential'
    });

  } catch (error) {
    console.error('Error verifying credential:', error);
    return res.status(500).json({ 
      verified: false,
      error: 'Verification service temporarily unavailable',
      details: error.message 
    });
  }
}

function checkForRealCredential(wallet) {
  // Only return true if the wallet ACTUALLY completed the process
  // Check localStorage/memory for completed KYC
  
  // For now, return false by default so users start at the beginning
  // This will be set to true only after they complete the demo or real KYC
  
  // In production, this would check your database
  console.log('🔍 Checking for real credential for:', wallet);
  
  // Return false by default - no auto-verification
  return false;
}