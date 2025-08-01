// Check available Defender API methods
require('dotenv').config();
const { Defender } = require('@openzeppelin/defender-sdk');

async function checkDefenderAPI() {
  try {
    const defender = new Defender({
      apiKey: process.env.DEFENDER_API_KEY,
      apiSecret: process.env.DEFENDER_API_SECRET,
    });

    console.log('🔍 Available Defender methods:');
    console.log('- action methods:', Object.getOwnPropertyNames(defender.action));
    
    // Get action details to see available methods
    const mintId = process.env.DEFENDER_MINT_AUTOTASK_ID;
    const action = await defender.action.get(mintId);
    console.log('\n📋 Action structure:');
    console.log(JSON.stringify(action, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDefenderAPI();
