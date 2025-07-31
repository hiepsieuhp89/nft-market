// Script to setup OpenZeppelin Defender Autotasks and Relayers
require('dotenv').config();
const { Defender } = require('@openzeppelin/defender-sdk');
const fs = require('fs');
const path = require('path');

async function setupDefender() {
  // Initialize Defender client
  const defender = new Defender({
    apiKey: process.env.DEFENDER_API_KEY,
    apiSecret: process.env.DEFENDER_API_SECRET,
  });

  try {
    console.log('🚀 Setting up OpenZeppelin Defender...');

    // 1. Use existing Relayer
    console.log('📡 Using existing Relayer...');
    const relayerId = process.env.DEFENDER_RELAYER_ID;
    const relayerAddress = process.env.DEFENDER_RELAYER_ADDRESS;

    if (!relayerId || !relayerAddress) {
      throw new Error('DEFENDER_RELAYER_ID and DEFENDER_RELAYER_ADDRESS must be set in .env');
    }

    const relayer = {
      relayerId: relayerId,
      address: relayerAddress
    };

    console.log(`✅ Using Relayer: ${relayer.relayerId}`);
    console.log(`📍 Relayer address: ${relayer.address}`);

    // 2. Create Mint NFT Autotask
    console.log('🎨 Creating Mint NFT Autotask...');
    const mintAutotaskCode = fs.readFileSync(
      path.join(__dirname, '../defender-autotasks/mint-nft-autotask.js'),
      'utf8'
    );

    const mintAutotask = await defender.action.create({
      name: 'Mint NFT Autotask',
      encodedZippedCode: await defender.action.getEncodedZippedCodeFromSources({
        'index.js': mintAutotaskCode
      }),
      relayerId: relayer.relayerId,
      trigger: {
        type: 'webhook',
      },
      paused: false,
    });

    console.log(`✅ Mint Autotask created: ${mintAutotask.actionId}`);

    // 3. Create Transfer NFT Autotask
    console.log('🔄 Creating Transfer NFT Autotask...');
    const transferAutotaskCode = fs.readFileSync(
      path.join(__dirname, '../defender-autotasks/transfer-nft-autotask.js'),
      'utf8'
    );

    const transferAutotask = await defender.action.create({
      name: 'Transfer NFT Autotask',
      encodedZippedCode: await defender.action.getEncodedZippedCodeFromSources({
        'index.js': transferAutotaskCode
      }),
      relayerId: relayer.relayerId,
      trigger: {
        type: 'webhook',
      },
      paused: false,
    });

    console.log(`✅ Transfer Autotask created: ${transferAutotask.actionId}`);

    // 4. Create Query NFT Autotask
    console.log('🔍 Creating Query NFT Autotask...');
    const queryAutotaskCode = fs.readFileSync(
      path.join(__dirname, '../defender-autotasks/query-nft-autotask.js'),
      'utf8'
    );

    const queryAutotask = await defender.action.create({
      name: 'Query NFT Autotask',
      encodedZippedCode: await defender.action.getEncodedZippedCodeFromSources({
        'index.js': queryAutotaskCode
      }),
      trigger: {
        type: 'webhook',
      },
      paused: false,
    });

    console.log(`✅ Query Autotask created: ${queryAutotask.actionId}`);

    // 5. Update environment variables
    console.log('📝 Updating environment variables...');
    const envContent = `
# OpenZeppelin Defender Configuration (Generated)
DEFENDER_RELAYER_ID="${relayer.relayerId}"
DEFENDER_RELAYER_ADDRESS="${relayer.address}"
DEFENDER_MINT_AUTOTASK_ID="${mintAutotask.actionId}"
DEFENDER_TRANSFER_AUTOTASK_ID="${transferAutotask.actionId}"
DEFENDER_QUERY_AUTOTASK_ID="${queryAutotask.actionId}"

# Webhook URLs
DEFENDER_MINT_WEBHOOK_URL="${mintAutotask.webhookUrl}"
DEFENDER_TRANSFER_WEBHOOK_URL="${transferAutotask.webhookUrl}"
DEFENDER_QUERY_WEBHOOK_URL="${queryAutotask.webhookUrl}"
`;

    fs.appendFileSync(path.join(__dirname, '../.env'), envContent);

    console.log('✅ Environment variables updated');

    // 6. Display setup summary
    console.log('\n🎉 OpenZeppelin Defender setup completed!');
    console.log('\n📋 Summary:');
    console.log(`Relayer ID: ${relayer.relayerId}`);
    console.log(`Relayer Address: ${relayer.address}`);
    console.log(`Mint Autotask ID: ${mintAutotask.actionId}`);
    console.log(`Transfer Autotask ID: ${transferAutotask.actionId}`);
    console.log(`Query Autotask ID: ${queryAutotask.actionId}`);

    console.log('\n🔗 Webhook URLs:');
    console.log(`Mint: ${mintAutotask.webhookUrl}`);
    console.log(`Transfer: ${transferAutotask.webhookUrl}`);
    console.log(`Query: ${queryAutotask.webhookUrl}`);

    console.log('\n⚠️  Important:');
    console.log('1. Fund your relayer address with MATIC for gas fees');
    console.log('2. Update your Autotask secrets with the following:');
    console.log('   - RPC_URL: Your Polygon RPC URL');
    console.log('   - CONTRACT_ADDRESS: Your NFT contract address');
    console.log('   - RELAYER_PRIVATE_KEY: Your relayer private key');

  } catch (error) {
    console.error('❌ Error setting up Defender:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDefender();
}

module.exports = { setupDefender };
