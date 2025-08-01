// Test script for NFT Marketplace Backend API
const axios = require('axios');

const BASE_URL = 'http://localhost:8081/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  displayName: 'Test User'
};

let authToken = '';
let userId = '';

async function testAPI() {
  console.log('🧪 Testing NFT Marketplace Backend API...\n');

  try {
    // 1. Test Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // 2. Test User Registration
    console.log('2️⃣ Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Registration successful:', registerResponse.data);
      authToken = registerResponse.data.accessToken;
      userId = registerResponse.data.user.uid;
    } catch (error) {
      if ((error.response?.status === 400 || error.response?.status === 409) &&
          (error.response?.data?.message?.includes('already exists') ||
           error.response?.data?.message?.includes('Email already exists'))) {
        console.log('ℹ️ User already exists, trying login...');
        
        // Try login instead
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ Login successful:', loginResponse.data);
        authToken = loginResponse.data.accessToken;
        userId = loginResponse.data.user.uid;
      } else {
        throw error;
      }
    }
    console.log('');

    // 3. Test Profile Access
    console.log('3️⃣ Testing Profile Access...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile:', profileResponse.data);
    console.log('');

    // 4. Test Wallet Info
    console.log('4️⃣ Testing Wallet Info...');
    const walletResponse = await axios.get(`${BASE_URL}/wallet/info`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Wallet Info:', walletResponse.data);
    console.log('');

    // 5. Test Wallet Balance
    console.log('5️⃣ Testing Wallet Balance...');
    const walletAddress = walletResponse.data.address;
    const balanceResponse = await axios.get(`${BASE_URL}/wallet/balance/${walletAddress}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Wallet Balance:', balanceResponse.data);
    console.log('');

    // 6. Test My NFTs
    console.log('6️⃣ Testing My NFTs...');
    const myNftsResponse = await axios.get(`${BASE_URL}/nft/my-nfts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ My NFTs:', myNftsResponse.data);
    console.log('');

    // 7. Test Transaction History
    console.log('7️⃣ Testing Transaction History...');
    const transactionsResponse = await axios.get(`${BASE_URL}/nft/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Transactions:', transactionsResponse.data);
    console.log('');

    console.log('🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run tests
testAPI();
