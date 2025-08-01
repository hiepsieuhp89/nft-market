// Test script for NFT Minting functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

const testNFT = {
  name: 'Test NFT',
  description: 'This is a test NFT created via API',
  imageUrl: 'https://gateway.pinata.cloud/ipfs/QmYourTestImageHash',
  price: 0.01
};

async function testMintNFT() {
  console.log('🎨 Testing NFT Minting...\n');

  try {
    // 1. Login to get auth token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const authToken = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    console.log('');

    // 2. Get wallet info
    console.log('2️⃣ Getting wallet info...');
    const walletResponse = await axios.get(`${BASE_URL}/wallet/info`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Wallet:', walletResponse.data);
    console.log('');

    // 3. Test mint NFT
    console.log('3️⃣ Testing NFT Mint...');
    try {
      const mintResponse = await axios.post(`${BASE_URL}/nft/mint`, testNFT, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ NFT Mint successful:', mintResponse.data);
    } catch (mintError) {
      console.log('ℹ️ Mint error (expected if Autotask not configured):', mintError.response?.data || mintError.message);
    }
    console.log('');

    // 4. Test Defender webhook directly
    console.log('4️⃣ Testing Defender Webhook...');
    const webhookUrl = process.env.DEFENDER_MINT_WEBHOOK_URL || 'https://api.defender.openzeppelin.com/autotasks/7d0bc3c1-7578-472e-afdf-8d03d4c6611b/runs/webhook/6LezjTeDEUNoNomzd2j5Ux';
    
    try {
      const webhookResponse = await axios.post(webhookUrl, {
        action: 'mint',
        to: walletResponse.data.address,
        tokenURI: 'https://gateway.pinata.cloud/ipfs/QmTestMetadata',
        price: '0.01'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });
      console.log('✅ Defender webhook response:', webhookResponse.data);
    } catch (webhookError) {
      console.log('ℹ️ Webhook error (expected if secrets not configured):', webhookError.response?.data || webhookError.message);
    }

    console.log('\n🎉 NFT Minting test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Load environment variables
require('dotenv').config();

// Run test
testMintNFT();
