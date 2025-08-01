// Update Autotask code via Defender SDK
require('dotenv').config();
const { Defender } = require('@openzeppelin/defender-sdk');
const fs = require('fs');
const path = require('path');

async function updateAutotaskCode() {
  try {
    console.log('🔄 Updating Autotask code...\n');

    // Initialize Defender client
    const client = new Defender({
      apiKey: process.env.DEFENDER_API_KEY,
      apiSecret: process.env.DEFENDER_API_SECRET,
    });

    // Read the real mint code
    const codePath = path.join(__dirname, '../defender-autotasks/mint-nft-autotask.js');
    const code = fs.readFileSync(codePath, 'utf8');

    console.log('📝 Code to upload:');
    console.log('─'.repeat(50));
    console.log(code.substring(0, 200) + '...');
    console.log('─'.repeat(50));

    // Get current Autotask info first
    const autotaskId = process.env.DEFENDER_MINT_AUTOTASK_ID;

    console.log(`🔍 Getting current Autotask info: ${autotaskId}`);
    const currentAutotask = await client.action.get(autotaskId);

    console.log(`🎯 Updating Autotask: ${autotaskId}`);

    const result = await client.action.update({
      actionId: autotaskId,
      name: currentAutotask.name,
      trigger: currentAutotask.trigger,
      paused: currentAutotask.paused,
      code: code,
    });

    console.log('✅ Autotask updated successfully!');
    console.log('📊 Result:', {
      autotaskId: result.autotaskId,
      name: result.name,
      codeDigest: result.codeDigest,
    });

  } catch (error) {
    console.error('❌ Error updating Autotask:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

updateAutotaskCode();
