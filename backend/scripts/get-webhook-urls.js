// Script to get webhook URLs from created autotasks
require('dotenv').config();
const { Defender } = require('@openzeppelin/defender-sdk');

async function getWebhookUrls() {
  try {
    console.log('🔧 Getting webhook URLs...');
    
    // Initialize Defender client
    const defender = new Defender({
      apiKey: process.env.DEFENDER_API_KEY,
      apiSecret: process.env.DEFENDER_API_SECRET,
    });

    const mintId = process.env.DEFENDER_MINT_AUTOTASK_ID;
    const transferId = process.env.DEFENDER_TRANSFER_AUTOTASK_ID;
    const queryId = process.env.DEFENDER_QUERY_AUTOTASK_ID;

    console.log('📡 Getting autotask details...');
    
    const mintAction = await defender.action.get(mintId);
    const transferAction = await defender.action.get(transferId);
    const queryAction = await defender.action.get(queryId);

    // Extract webhook tokens
    const mintToken = mintAction.trigger?.token;
    const transferToken = transferAction.trigger?.token;
    const queryToken = queryAction.trigger?.token;

    console.log('\n🔗 Webhook URLs:');
    if (mintToken) {
      console.log(`Mint: https://api.defender.openzeppelin.com/autotasks/${mintId}/runs/webhook/${mintToken}`);
    }
    if (transferToken) {
      console.log(`Transfer: https://api.defender.openzeppelin.com/autotasks/${transferId}/runs/webhook/${transferToken}`);
    }
    if (queryToken) {
      console.log(`Query: https://api.defender.openzeppelin.com/autotasks/${queryId}/runs/webhook/${queryToken}`);
    }

    console.log('\n📋 Tokens:');
    console.log(`Mint token: ${mintToken}`);
    console.log(`Transfer token: ${transferToken}`);
    console.log(`Query token: ${queryToken}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getWebhookUrls();
