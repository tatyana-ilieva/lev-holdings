// pages/api/create-sumsub-token.js
import crypto from 'crypto';

export default async function handler(req, res) {
  console.log('🔥 Sumsub API called!');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.body;
  console.log('📧 Wallet address received:', walletAddress);

  if (!walletAddress) {
    console.log('❌ No wallet address provided');
    return res.status(400).json({ error: 'Wallet address required' });
  }

  const externalUserId = `lev_${walletAddress}`;
  console.log('🆔 External user ID:', externalUserId);

  // Get Sumsub credentials
  const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
  const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
  
  console.log('🔑 Sumsub token exists:', !!SUMSUB_APP_TOKEN);
  console.log('🔐 Sumsub secret exists:', !!SUMSUB_SECRET_KEY);

  if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
    console.log('❌ Missing Sumsub credentials');
    return res.status(500).json({ 
      error: 'Sumsub credentials not configured',
      details: 'Add SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY to .env.local',
      hasToken: !!SUMSUB_APP_TOKEN,
      hasSecret: !!SUMSUB_SECRET_KEY
    });
  }

  const SUMSUB_BASE_URL = 'https://api.sumsub.com';

  try {
    const levelName = 'basic-kyc-level';
    const method = 'POST';
    const url = `/resources/accessTokens?userId=${externalUserId}&levelName=${levelName}`;
    const timestamp = Math.floor(Date.now() / 1000);
    
    console.log('📝 Creating signature...');
    console.log('Timestamp:', timestamp);
    console.log('URL:', url);
    
    // Create Sumsub signature
    const signature = crypto
      .createHmac('sha256', SUMSUB_SECRET_KEY)
      .update(timestamp + method + url)
      .digest('hex');

    console.log('✅ Signature created');

    const requestBody = {
      externalUserId: externalUserId,
      levelName: levelName,
    };

    console.log('📤 Making request to Sumsub...');
    console.log('URL:', `${SUMSUB_BASE_URL}${url}`);

    const response = await fetch(`${SUMSUB_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN,
        'X-App-Access-Sig': signature,
        'X-App-Access-Ts': timestamp,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Sumsub response status:', response.status);

    const data = await response.json();
    console.log('📊 Sumsub response data:', data);

    if (response.ok) {
      console.log('✅ Sumsub token created successfully');
      return res.status(200).json({
        success: true,
        token: data.token,
        userId: data.userId,
      });
    } else {
      console.error('❌ Sumsub API error:', data);
      throw new Error(data.description || `Sumsub API returned ${response.status}`);
    }
  } catch (error) {
    console.error('💥 Sumsub token error:', error);
    
    // Return a fallback for demo purposes
    return res.status(200).json({
      success: true,
      token: 'DEMO_TOKEN_' + Date.now(),
      userId: externalUserId,
      demo: true,
      error: 'Real Sumsub failed - using demo token',
      details: error.message
    });
  }
}