// Test OpenZeppelin Defender Autotasks with updated secrets
require('dotenv').config();
const axios = require('axios');

async function testAutotasks() {
  console.log('🧪 Testing OpenZeppelin Defender Autotasks...\n');

  try {
    // Test data
    const testWallet = '0x50A4B1Be70966125bEDf30EA51aE988A7bD28DA1';
    const testTokenURI = 'https://gateway.pinata.cloud/ipfs/QmTestMetadata';
    const testPrice = '0.01';

    // Get webhook URLs from environment
    const mintWebhook = process.env.DEFENDER_MINT_WEBHOOK_URL;
    const transferWebhook = process.env.DEFENDER_TRANSFER_WEBHOOK_URL;
    const queryWebhook = process.env.DEFENDER_QUERY_WEBHOOK_URL;

    console.log('🔗 Webhook URLs:');
    console.log(`Mint: ${mintWebhook}`);
    console.log(`Transfer: ${transferWebhook}`);
    console.log(`Query: ${queryWebhook}`);
    console.log('');

    // 1. Test Mint Autotask
    console.log('1️⃣ Testing Mint Autotask...');
    try {
      const mintResponse = await axios.post(mintWebhook, {
        action: 'mint',
        to: testWallet,
        tokenURI: testTokenURI,
        price: testPrice
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Token': '6LezjTeDEUNoNomzd2j5Ux'
        },
        timeout: 30000
      });

      console.log('✅ Mint Autotask Response:');
      console.log(JSON.stringify(mintResponse.data, null, 2));
      
    } catch (mintError) {
      console.log('❌ Mint Autotask Error:');
      if (mintError.response) {
        console.log('Status:', mintError.response.status);
        console.log('Data:', mintError.response.data);
      } else {
        console.log('Error:', mintError.message);
      }
    }
    console.log('');

    // 2. Test Query Autotask
    console.log('2️⃣ Testing Query Autotask...');
    try {
      const queryResponse = await axios.post(queryWebhook, {
        action: 'getNFTsByOwner',
        owner: testWallet
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      console.log('✅ Query Autotask Response:');
      console.log(JSON.stringify(queryResponse.data, null, 2));
      
    } catch (queryError) {
      console.log('❌ Query Autotask Error:');
      if (queryError.response) {
        console.log('Status:', queryError.response.status);
        console.log('Data:', queryError.response.data);
      } else {
        console.log('Error:', queryError.message);
      }
    }
    console.log('');

    // 3. Test Transfer Autotask (only if we have a token to transfer)
    console.log('3️⃣ Testing Transfer Autotask...');
    try {
      const transferResponse = await axios.post(transferWebhook, {
        action: 'transfer',
        from: testWallet,
        to: '0x33D3FEbf36126e5f7A47Ed52128Da3eb0184A980', // Contract deployer
        tokenId: '0' // Assuming token ID 0 exists
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      console.log('✅ Transfer Autotask Response:');
      console.log(JSON.stringify(transferResponse.data, null, 2));
      
    } catch (transferError) {
      console.log('❌ Transfer Autotask Error (expected if no tokens exist):');
      if (transferError.response) {
        console.log('Status:', transferError.response.status);
        console.log('Data:', transferError.response.data);
      } else {
        console.log('Error:', transferError.message);
      }
    }

    console.log('\n🎉 Autotask testing completed!');
    console.log('\n📋 Summary:');
    console.log('- If mint works: Secrets are configured correctly');
    console.log('- If query works: Contract connection is working');
    console.log('- If transfer fails: Normal (no tokens to transfer yet)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAutotasks();
