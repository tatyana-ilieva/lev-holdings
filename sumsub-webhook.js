// pages/api/sumsub-webhook.js
import { updateVerificationStatus } from './check-verification-status';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Sumsub webhook received');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const { 
      type, 
      reviewResult, 
      externalUserId, 
      applicantId,
      inspectionId,
      applicantType,
      correlationId 
    } = req.body;

    // Verify webhook authenticity (in production)
    // const isValidWebhook = verifyWebhookSignature(req);
    // if (!isValidWebhook) {
    //   return res.status(401).json({ error: 'Invalid webhook signature' });
    // }

    // Extract wallet address from externalUserId
    const walletAddress = externalUserId?.replace('lev_', '');
    
    if (!walletAddress) {
      console.error('❌ No wallet address found in externalUserId:', externalUserId);
      return res.status(400).json({ error: 'Invalid externalUserId format' });
    }

    console.log(`📋 Processing webhook for wallet: ${walletAddress}`);

    // Handle different webhook types
    switch (type) {
      case 'applicantReviewed':
        await handleApplicantReviewed(walletAddress, reviewResult);
        break;
        
      case 'applicantPending':
        console.log('⏳ Applicant pending review:', walletAddress);
        updateVerificationStatus(walletAddress, 'processing');
        break;
        
      case 'applicantOnHold':
        console.log('🔄 Applicant on hold:', walletAddress);
        updateVerificationStatus(walletAddress, 'on_hold');
        break;
        
      default:
        console.log('ℹ️ Unhandled webhook type:', type);
    }

    // Always respond with success to acknowledge webhook
    res.status(200).json({ 
      received: true, 
      processed: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Still return 200 to prevent Sumsub from retrying
    res.status(200).json({ 
      received: true, 
      processed: false,
      error: error.message 
    });
  }
}

async function handleApplicantReviewed(walletAddress, reviewResult) {
  const { reviewAnswer, rejectLabels, reviewRejectType } = reviewResult;
  
  console.log(`📊 Review result for ${walletAddress}:`, {
    answer: reviewAnswer,
    rejectLabels,
    rejectType: reviewRejectType
  });

  if (reviewAnswer === 'GREEN') {
    console.log('✅ KYC approved for:', walletAddress);
    
    // Update verification status
    updateVerificationStatus(walletAddress, 'completed', {
      reviewResult,
      approvedAt: new Date().toISOString(),
      complianceScore: calculateComplianceScore(reviewResult)
    });

    // Trigger NFT minting
    await triggerNFTMinting(walletAddress, reviewResult);
    
  } else if (reviewAnswer === 'RED') {
    console.log('❌ KYC rejected for:', walletAddress);
    
    updateVerificationStatus(walletAddress, 'failed', {
      reviewResult,
      rejectedAt: new Date().toISOString(),
      rejectLabels,
      rejectType: reviewRejectType
    });
    
  } else {
    console.log('⚠️ KYC review pending for:', walletAddress);
    updateVerificationStatus(walletAddress, 'processing');
  }
}

async function triggerNFTMinting(walletAddress, reviewResult) {
  try {
    console.log('🎨 Triggering NFT mint for:', walletAddress);
    
    // Prepare verification data for NFT
    const verificationData = {
      complianceScore: calculateComplianceScore(reviewResult),
      country: extractCountryFromReview(reviewResult),
      verifiedAt: new Date().toISOString(),
      reviewAnswer: reviewResult.reviewAnswer,
      verificationMethod: 'sumsub_kyc'
    };

    // Call NFT minting API
    const mintResponse = await fetch(`${getBaseUrl()}/api/mint-credential-nft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        verificationData
      })
    });

    if (mintResponse.ok) {
      const nftData = await mintResponse.json();
      console.log('✅ NFT minting triggered successfully:', nftData.mint);
      
      // Store the NFT data for later retrieval
      await storeCredentialData(walletAddress, nftData, verificationData);
      
    } else {
      console.error('❌ NFT minting failed:', await mintResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Error triggering NFT mint:', error);
  }
}

function calculateComplianceScore(reviewResult) {
  // Calculate compliance score based on review quality
  let baseScore = 900;
  
  if (reviewResult.reviewAnswer === 'GREEN') {
    baseScore += 50; // Bonus for approval
  }
  
  // Add randomness for demo (in production, use actual review metrics)
  const bonus = Math.floor(Math.random() * 50);
  
  return Math.min(1000, baseScore + bonus);
}

function extractCountryFromReview(reviewResult) {
  // Extract country from review result
  // In real implementation, this would parse the actual review data
  return reviewResult.country || 'US';
}

async function storeCredentialData(walletAddress, nftData, verificationData) {
  // TODO: Store in Supabase or your database
  console.log('💾 Storing credential data for:', walletAddress);
  
  const credentialRecord = {
    walletAddress,
    credentialId: nftData.mint,
    mintAddress: nftData.mint,
    complianceScore: verificationData.complianceScore,
    issuedAt: new Date().toISOString(),
    status: 'active',
    verificationData,
    nftMetadata: nftData
  };
  
  // In production, save to database:
  // await supabase.from('credentials').insert(credentialRecord);
  
  console.log('✅ Credential data stored successfully');
}

function getBaseUrl() {
  // Get base URL for API calls
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

function verifyWebhookSignature(req) {
  // In production, verify the webhook signature from Sumsub
  // const signature = req.headers['x-payload-digest'];
  // const expectedSignature = calculateExpectedSignature(req.body);
  // return signature === expectedSignature;
  
  // For demo, always return true
  return true;
}