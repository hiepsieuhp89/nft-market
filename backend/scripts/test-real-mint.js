// Test real mint NFT via webhook
require('dotenv').config();
const axios = require('axios');

async function testRealMint() {
  console.log('🎨 Testing Real NFT Mint via Webhook...\n');

  const webhookUrl = process.env.DEFENDER_MINT_WEBHOOK_URL;
  
  // Real mint payload
  const mintPayload = {
    action: 'mint',
    to: '0x50A4B1Be70966125bEDf30EA51aE988A7bD28DA1', // Test address
    tokenURI: 'https://gateway.pinata.cloud/ipfs/QmTestMetadata123',
    price: '0.01' // 0.01 MATIC
  };

  console.log(`🔗 URL: ${webhookUrl}`);
  console.log(`📦 Mint Payload:`, mintPayload);

  try {
    const response = await axios.post(webhookUrl, mintPayload, {
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'NFT-Marketplace-Backend/1.0'
      },
      timeout: 60000 // 60 seconds for blockchain transaction
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
      const result = JSON.parse(response.data.result);
      console.log('\n📊 Mint Result:', result);
      
      if (result.success) {
        console.log('\n🎉 NFT MINTED SUCCESSFULLY!');
        console.log('🆔 Token ID:', result.tokenId);
        console.log('🔗 Transaction Hash:', result.transactionHash);
        console.log('📦 Block Number:', result.blockNumber);
        console.log('⛽ Gas Used:', result.gasUsed);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.data?.encodedLogs) {
      const logs = Buffer.from(error.response.data.encodedLogs, 'base64').toString('utf8');
      console.log('\n📋 Error Logs:');
      console.log('─'.repeat(50));
      console.log(logs);
      console.log('─'.repeat(50));
    }
  }
}

testRealMint();
