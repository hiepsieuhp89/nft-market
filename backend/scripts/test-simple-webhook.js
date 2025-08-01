// Simple test for webhook without complex payload
require('dotenv').config();
const axios = require('axios');

async function testSimpleWebhook() {
  console.log('🧪 Testing Simple Webhook...\n');

  const webhookUrl = process.env.DEFENDER_MINT_WEBHOOK_URL;
  
  // Very simple payload
  const simplePayload = {
    action: 'test',
    message: 'hello from backend'
  };

  console.log(`🔗 URL: ${webhookUrl}`);
  console.log(`📦 Payload:`, simplePayload);

  try {
    const response = await axios.post(webhookUrl, simplePayload, {
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'NFT-Marketplace-Backend/1.0'
      },
      timeout: 30000
    });

    console.log('\n✅ Response received:');
    console.log('Status:', response.data.status);
    console.log('Autotask ID:', response.data.autotaskId);
    
    if (response.data.encodedLogs) {
      const logs = Buffer.from(response.data.encodedLogs, 'base64').toString('utf8');
      console.log('\n📋 Decoded Logs:');
      console.log('─'.repeat(50));
      console.log(logs);
      console.log('─'.repeat(50));
    }

    if (response.data.result) {
      console.log('\n📊 Result:', response.data.result);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSimpleWebhook();
