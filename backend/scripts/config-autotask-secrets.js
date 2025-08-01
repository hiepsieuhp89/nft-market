// Script to configure secrets for OpenZeppelin Defender Autotasks
require('dotenv').config();
const { Defender } = require('@openzeppelin/defender-sdk');

async function configAutotaskSecrets() {
  console.log('🔐 Configuring Autotask Secrets...\n');

  try {
    // Initialize Defender client
    const defender = new Defender({
      apiKey: process.env.DEFENDER_API_KEY,
      apiSecret: process.env.DEFENDER_API_SECRET,
    });

    // Get autotask IDs from environment
    const mintAutotaskId = process.env.DEFENDER_MINT_AUTOTASK_ID;
    const transferAutotaskId = process.env.DEFENDER_TRANSFER_AUTOTASK_ID;
    const queryAutotaskId = process.env.DEFENDER_QUERY_AUTOTASK_ID;

    // Secrets to configure
    const secrets = {
      RPC_URL: process.env.RPC_URL || process.env.POLYGON_RPC_URL,
      CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
      RELAYER_PRIVATE_KEY: process.env.PRIVATE_KEY, // This will be the relayer's private key
    };

    console.log('📋 Secrets to configure:');
    console.log(`- RPC_URL: ${secrets.RPC_URL}`);
    console.log(`- CONTRACT_ADDRESS: ${secrets.CONTRACT_ADDRESS}`);
    console.log(`- RELAYER_PRIVATE_KEY: ${secrets.RELAYER_PRIVATE_KEY ? '***configured***' : 'NOT SET'}`);
    console.log('');

    // Validate required secrets
    if (!secrets.RPC_URL || !secrets.CONTRACT_ADDRESS || !secrets.RELAYER_PRIVATE_KEY) {
      throw new Error('Missing required secrets. Please check your .env file.');
    }

    // Configure secrets for Mint Autotask
    if (mintAutotaskId) {
      console.log('🎨 Configuring Mint Autotask secrets...');
      await defender.action.updateSecrets({
        actionId: mintAutotaskId,
        secrets: secrets
      });
      console.log('✅ Mint Autotask secrets configured');
    }

    // Configure secrets for Transfer Autotask
    if (transferAutotaskId) {
      console.log('🔄 Configuring Transfer Autotask secrets...');
      await defender.action.updateSecrets({
        actionId: transferAutotaskId,
        secrets: secrets
      });
      console.log('✅ Transfer Autotask secrets configured');
    }

    // Configure secrets for Query Autotask (doesn't need RELAYER_PRIVATE_KEY)
    if (queryAutotaskId) {
      console.log('🔍 Configuring Query Autotask secrets...');
      const querySecrets = {
        RPC_URL: secrets.RPC_URL,
        CONTRACT_ADDRESS: secrets.CONTRACT_ADDRESS,
      };
      await defender.action.updateSecrets({
        actionId: queryAutotaskId,
        secrets: querySecrets
      });
      console.log('✅ Query Autotask secrets configured');
    }

    console.log('\n🎉 All Autotask secrets configured successfully!');
    console.log('\n⚠️  Important:');
    console.log('- Make sure your relayer has enough MATIC for gas fees');
    console.log('- Test the autotasks with small amounts first');

  } catch (error) {
    console.error('❌ Error configuring secrets:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

configAutotaskSecrets();
