// Test different authentication methods for OpenZeppelin Defender webhooks
require('dotenv').config();
const axios = require('axios');

async function testWebhookAuth() {
  console.log('🔐 Testing Webhook Authentication Methods...\n');

  const webhookUrl = process.env.DEFENDER_MINT_WEBHOOK_URL;
  const testPayload = {
    action: 'mint',
    to: '0x50A4B1Be70966125bEDf30EA51aE988A7bD28DA1',
    tokenURI: 'https://gateway.pinata.cloud/ipfs/QmTestMetadata',
    price: '0.01'
  };

  console.log(`🔗 Testing URL: ${webhookUrl}\n`);

  if (!webhookUrl) {
    console.log('❌ No webhook URL found in environment variables');
    return;
  }

  // Method 1: Test with proper User-Agent (like backend)
  console.log('1️⃣ Testing with User-Agent header...');
  try {
    const response1 = await axios.post(webhookUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NFT-Marketplace-Backend/1.0'
      },
      timeout: 15000
    });
    console.log('✅ Success with User-Agent:', response1.data);
    return;
  } catch (error1) {
    console.log('❌ Failed with User-Agent:', error1.response?.data || error1.message);
  }

  // Method 2: With webhook token in header
  console.log('\n2️⃣ Testing with webhook token in header...');
  try {
    const response2 = await axios.post(webhookUrl, testPayload, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 6LezjTeDEUNoNomzd2j5Ux'
      },
      timeout: 15000
    });
    console.log('✅ Success with Bearer token:', response2.data);
    return;
  } catch (error2) {
    console.log('❌ Failed with Bearer token:', error2.response?.data || error2.message);
  }

  // Method 3: With X-Webhook-Token header
  console.log('\n3️⃣ Testing with X-Webhook-Token header...');
  try {
    const response3 = await axios.post(webhookUrl, testPayload, {
      headers: { 
        'Content-Type': 'application/json',
        'X-Webhook-Token': '6LezjTeDEUNoNomzd2j5Ux'
      },
      timeout: 15000
    });
    console.log('✅ Success with X-Webhook-Token:', response3.data);
    return;
  } catch (error3) {
    console.log('❌ Failed with X-Webhook-Token:', error3.response?.data || error3.message);
  }

  // Method 4: With API key from environment
  console.log('\n4️⃣ Testing with API key...');
  try {
    const response4 = await axios.post(webhookUrl, testPayload, {
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': process.env.DEFENDER_API_KEY
      },
      timeout: 15000
    });
    console.log('✅ Success with API key:', response4.data);
    return;
  } catch (error4) {
    console.log('❌ Failed with API key:', error4.response?.data || error4.message);
  }

  // Method 5: Test with different payload format
  console.log('\n5️⃣ Testing with different payload format...');
  try {
    const response5 = await axios.post(webhookUrl, {
      request: {
        body: JSON.stringify(testPayload)
      }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    console.log('✅ Success with wrapped payload:', response5.data);
    return;
  } catch (error5) {
    console.log('❌ Failed with wrapped payload:', error5.response?.data || error5.message);
  }

  console.log('\n❌ All authentication methods failed!');
  console.log('\n💡 Solutions:');
  console.log('1. Check Autotask trigger settings in Defender console');
  console.log('2. Ensure webhook is set to "Public" or "No Authentication"');
  console.log('3. Try recreating the Autotask with correct settings');
  console.log('4. Check if Autotask is paused or has errors');
}

testWebhookAuth();
