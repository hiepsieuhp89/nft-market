// Test script to check OpenZeppelin Defender SDK
require('dotenv').config();
const { Defender } = require('@openzeppelin/defender-sdk');

async function testDefender() {
  try {
    console.log('🔧 Testing Defender SDK...');
    
    // Initialize Defender client
    const defender = new Defender({
      apiKey: process.env.DEFENDER_API_KEY,
      apiSecret: process.env.DEFENDER_API_SECRET,
    });

    console.log('✅ Defender client initialized');
    
    // Test getting existing relayer
    const relayerId = process.env.DEFENDER_RELAYER_ID;
    console.log(`📡 Testing relayer: ${relayerId}`);
    
    const relayer = await defender.relay.get(relayerId);
    console.log('✅ Relayer found:', relayer);
    
    // Test available methods
    console.log('🔍 Available defender methods:');
    console.log('- relay:', Object.getOwnPropertyNames(defender.relay));
    console.log('- action:', typeof defender.action);
    console.log('- autotask:', typeof defender.autotask);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDefender();
