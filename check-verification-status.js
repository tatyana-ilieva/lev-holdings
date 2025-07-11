// pages/api/check-verification-status.js

// In-memory store for demo (in production, use database)
const verificationStatuses = new Map();
const verificationTimestamps = new Map();

export default async function handler(req, res) {
  const { wallet } = req.query;
  
  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  try {
    console.log('📊 Checking verification status for:', wallet);

    // Get stored status
    const currentStatus = verificationStatuses.get(wallet) || 'none';
    const timestamp = verificationTimestamps.get(wallet);
    
    // Simulate verification progression for demo
    if (currentStatus === 'processing') {
      const timeSinceStart = timestamp ? Date.now() - timestamp : 0;
      
      // After 10 seconds, mark as completed for demo
      if (timeSinceStart > 10000) {
        const completedData = {
          status: 'completed',
          verificationData: {
            walletAddress: wallet,
            documents: ['government_id', 'selfie_with_liveness'],
            verifiedAt: new Date().toISOString(),
            complianceScore: Math.floor(Math.random() * 50) + 950,
            country: 'US',
            ageVerified: true,
            amlStatus: 'clear',
            riskLevel: 'low'
          },
          completedAt: new Date().toISOString()
        };
        
        verificationStatuses.set(wallet, 'completed');
        console.log('✅ Verification completed for:', wallet);
        return res.status(200).json(completedData);
      }
      
      // Still processing
      return res.status(200).json({
        status: 'processing',
        message: 'Document verification in progress',
        estimatedTimeRemaining: Math.max(0, 15 - Math.floor(timeSinceStart / 1000)),
        progress: Math.min(90, Math.floor((timeSinceStart / 10000) * 90))
      });
    }
    
    // Return current status
    const statusResponse = {
      status: currentStatus,
      wallet: wallet,
      lastChecked: new Date().toISOString()
    };

    if (currentStatus === 'completed') {
      statusResponse.verificationData = {
        walletAddress: wallet,
        complianceScore: Math.floor(Math.random() * 50) + 950,
        verifiedAt: new Date().toISOString(),
        country: 'US'
      };
    }

    return res.status(200).json(statusResponse);

  } catch (error) {
    console.error('Error checking verification status:', error);
    return res.status(500).json({ 
      status: 'error',
      error: 'Failed to check verification status',
      details: error.message 
    });
  }
}

// Helper function to update status (called by other APIs)
export function updateVerificationStatus(wallet, status, data = {}) {
  verificationStatuses.set(wallet, status);
  verificationTimestamps.set(wallet, Date.now());
  
  console.log(`📝 Updated verification status for ${wallet}: ${status}`);
  
  if (status === 'processing') {
    // Auto-complete after delay for demo
    setTimeout(() => {
      if (verificationStatuses.get(wallet) === 'processing') {
        verificationStatuses.set(wallet, 'completed');
        console.log(`⏰ Auto-completed verification for ${wallet}`);
      }
    }, 15000); // 15 seconds for demo
  }
}

// API endpoint to manually update status (for testing)
export async function POST(req, res) {
  const { wallet, status } = req.body;
  
  if (!wallet || !status) {
    return res.status(400).json({ error: 'Wallet and status required' });
  }
  
  updateVerificationStatus(wallet, status);
  
  return res.status(200).json({ 
    success: true, 
    message: `Status updated to ${status} for ${wallet}` 
  });
}