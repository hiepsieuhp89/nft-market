// Script to setup OpenZeppelin Defender Autotasks and Relayers
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

    // 1. Create Relayer
    console.log('📡 Creating Relayer...');
    const relayer = await defender.relay.create({
      name: 'NFT Marketplace Relayer',
      network: 'polygon-amoy', // or your target network
      minBalance: BigInt(1e17), // 0.1 MATIC
    });

    console.log(`✅ Relayer created: ${relayer.relayerId}`);
    console.log(`📍 Relayer address: ${relayer.address}`);

    // 2. Create Mint NFT Autotask
    console.log('🎨 Creating Mint NFT Autotask...');
    const mintAutotaskCode = fs.readFileSync(
      path.join(__dirname, '../defender-autotasks/mint-nft-autotask.js'),
      'utf8'
    );

    const mintAutotask = await defender.autotask.create({
      name: 'Mint NFT Autotask',
      encodedZippedCode: await defender.autotask.getEncodedZippedCodeFromFolder(
        path.join(__dirname, '../defender-autotasks')
      ),
      relayerId: relayer.relayerId,
      trigger: {
        type: 'webhook',
      },
      paused: false,
    });

    console.log(`✅ Mint Autotask created: ${mintAutotask.autotaskId}`);

    // 3. Create Transfer NFT Autotask
    console.log('🔄 Creating Transfer NFT Autotask...');
    const transferAutotask = await defender.autotask.create({
      name: 'Transfer NFT Autotask',
      encodedZippedCode: await defender.autotask.getEncodedZippedCodeFromFolder(
        path.join(__dirname, '../defender-autotasks')
      ),
      relayerId: relayer.relayerId,
      trigger: {
        type: 'webhook',
      },
      paused: false,
    });

    console.log(`✅ Transfer Autotask created: ${transferAutotask.autotaskId}`);

    // 4. Create Query NFT Autotask
    console.log('🔍 Creating Query NFT Autotask...');
    const queryAutotask = await defender.autotask.create({
      name: 'Query NFT Autotask',
      encodedZippedCode: await defender.autotask.getEncodedZippedCodeFromFolder(
        path.join(__dirname, '../defender-autotasks')
      ),
      trigger: {
        type: 'webhook',
      },
      paused: false,
    });

    console.log(`✅ Query Autotask created: ${queryAutotask.autotaskId}`);

    // 5. Update environment variables
    console.log('📝 Updating environment variables...');
    const envContent = `
# OpenZeppelin Defender Configuration (Generated)
DEFENDER_RELAYER_ID="${relayer.relayerId}"
DEFENDER_RELAYER_ADDRESS="${relayer.address}"
DEFENDER_MINT_AUTOTASK_ID="${mintAutotask.autotaskId}"
DEFENDER_TRANSFER_AUTOTASK_ID="${transferAutotask.autotaskId}"
DEFENDER_QUERY_AUTOTASK_ID="${queryAutotask.autotaskId}"

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
    console.log(`Mint Autotask ID: ${mintAutotask.autotaskId}`);
    console.log(`Transfer Autotask ID: ${transferAutotask.autotaskId}`);
    console.log(`Query Autotask ID: ${queryAutotask.autotaskId}`);

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
