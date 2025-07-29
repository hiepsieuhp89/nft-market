#!/usr/bin/env node

/**
 * Environment validation script for NFT Marketplace
 * Checks if all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const validationRules = {
  // Required blockchain configuration
  'NEXT_PUBLIC_CONTRACT_ADDRESS': {
    required: true,
    validate: (value) => /^0x[a-fA-F0-9]{40}$/.test(value),
    message: 'Must be a valid Ethereum address (0x...)'
  },
  'NEXT_PUBLIC_CHAIN_ID': {
    required: true,
    validate: (value) => !isNaN(value) && parseInt(value) > 0,
    message: 'Must be a valid chain ID number'
  },
  'NEXT_PUBLIC_RPC_URL': {
    required: true,
    validate: (value) => value.startsWith('http'),
    message: 'Must be a valid HTTP/HTTPS URL'
  },

  // IPFS configuration (at least one method required)
  'NEXT_PUBLIC_PINATA_API_KEY': {
    required: false,
    validate: (value) => !value || value.length > 10,
    message: 'If provided, must be a valid Pinata API key'
  },
  'NEXT_PUBLIC_PINATA_JWT': {
    required: false,
    validate: (value) => !value || value.startsWith('eyJ'),
    message: 'If provided, must be a valid JWT token'
  },

  // Firebase configuration (optional but recommended)
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': {
    required: false,
    validate: (value) => !value || /^[a-z0-9-]+$/.test(value),
    message: 'If provided, must be a valid Firebase project ID'
  },

  // Network configuration
  'NEXT_PUBLIC_NETWORK_NAME': {
    required: true,
    validate: (value) => value && value.length > 0,
    message: 'Network name is required'
  }
};

function validateEnvironment() {
  console.log('🔍 Validating NFT Marketplace Environment Configuration');
  console.log('====================================================\n');

  let hasErrors = false;
  let hasWarnings = false;

  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('💡 Run: npm run setup\n');
    return false;
  }

  console.log('✅ .env file found\n');

  // Validate each environment variable
  for (const [key, rule] of Object.entries(validationRules)) {
    const value = process.env[key];
    
    if (rule.required && !value) {
      console.log(`❌ ${key}: Missing required environment variable`);
      hasErrors = true;
      continue;
    }

    if (value && !rule.validate(value)) {
      console.log(`❌ ${key}: ${rule.message}`);
      console.log(`   Current value: ${value.substring(0, 20)}...`);
      hasErrors = true;
      continue;
    }

    if (value) {
      console.log(`✅ ${key}: OK`);
    } else {
      console.log(`⚠️  ${key}: Not configured (optional)`);
      hasWarnings = true;
    }
  }

  // Special validations
  console.log('\n🔍 Additional Validations:');

  // Check IPFS configuration
  const hasPinataKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const hasPinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  
  if (!hasPinataKey && !hasPinataJWT) {
    console.log('⚠️  IPFS: No Pinata configuration found. NFT metadata will use fallback data URLs.');
    hasWarnings = true;
  } else {
    console.log('✅ IPFS: Pinata configuration found');
  }

  // Check Firebase configuration
  const firebaseKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  ];
  
  const hasFirebase = firebaseKeys.some(key => process.env[key]);
  if (!hasFirebase) {
    console.log('⚠️  Firebase: No configuration found. Database features may not work.');
    hasWarnings = true;
  } else {
    console.log('✅ Firebase: Configuration found');
  }

  // Check optional services
  if (process.env.NEXT_PUBLIC_MORALIS_API_KEY) {
    console.log('✅ Moralis: API key configured');
  } else {
    console.log('⚠️  Moralis: Not configured (optional)');
  }

  if (process.env.NEXT_PUBLIC_GRAPH_API_URL && 
      !process.env.NEXT_PUBLIC_GRAPH_API_URL.includes('your-subgraph-id')) {
    console.log('✅ The Graph: Subgraph URL configured');
  } else {
    console.log('⚠️  The Graph: Not configured (optional)');
  }

  // Summary
  console.log('\n📊 Validation Summary:');
  if (hasErrors) {
    console.log('❌ Configuration has errors that must be fixed');
    console.log('💡 Run: npm run setup to reconfigure\n');
    return false;
  } else if (hasWarnings) {
    console.log('⚠️  Configuration is valid but has warnings');
    console.log('✅ You can proceed with development');
    console.log('💡 Consider configuring optional services for full functionality\n');
    return true;
  } else {
    console.log('✅ All configurations are valid!');
    console.log('🚀 Ready to start development\n');
    return true;
  }
}

// Network connectivity test
async function testConnectivity() {
  console.log('🌐 Testing Network Connectivity:');
  
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (rpcUrl) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      
      if (response.ok) {
        console.log('✅ RPC connection successful');
      } else {
        console.log('❌ RPC connection failed');
      }
    } catch (error) {
      console.log('❌ RPC connection error:', error.message);
    }
  }

  // Test IPFS gateway
  const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY;
  if (ipfsGateway) {
    try {
      const testHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'; // Hello World
      const response = await fetch(`${ipfsGateway}${testHash}`);
      
      if (response.ok) {
        console.log('✅ IPFS gateway accessible');
      } else {
        console.log('⚠️  IPFS gateway may have issues');
      }
    } catch (error) {
      console.log('⚠️  IPFS gateway test failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  const isValid = validateEnvironment();
  
  if (isValid) {
    await testConnectivity();
  }
  
  process.exit(isValid ? 0 : 1);
}

main().catch(console.error);
