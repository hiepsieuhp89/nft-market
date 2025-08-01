#!/usr/bin/env node

/**
 * Script to setup AWS Parameter Store with environment variables
 * Run this script after creating AWS credentials
 */

const { SSMClient, PutParameterCommand } = require('@aws-sdk/client-ssm');
require('dotenv').config();

// AWS Client configuration
const ssmClient = new SSMClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Environment variables to store in Parameter Store
const parameters = {
  'FIREBASE_PRIVATE_KEY': process.env.FIREBASE_PRIVATE_KEY,
  'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID || 'lavie-196cd',
  'FIREBASE_CLIENT_EMAIL': process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@lavie-196cd.iam.gserviceaccount.com',
  'FIREBASE_API_KEY': process.env.FIREBASE_API_KEY || 'AIzaSyDbyPtD6BVEbefBieILYeBjLCS35abN7aM',
  'FIREBASE_AUTH_DOMAIN': process.env.FIREBASE_AUTH_DOMAIN || 'lavie-196cd.firebaseapp.com',
  'FIREBASE_STORAGE_BUCKET': process.env.FIREBASE_STORAGE_BUCKET || 'lavie-196cd.firebasestorage.app',
  'FIREBASE_MESSAGING_SENDER_ID': process.env.FIREBASE_MESSAGING_SENDER_ID || '631172388937',
  'FIREBASE_APP_ID': process.env.FIREBASE_APP_ID || '1:631172388937:web:3de000ee30131caeba4798',
  'FIREBASE_MEASUREMENT_ID': process.env.FIREBASE_MEASUREMENT_ID || 'G-HVM047V56C',
  
  'DEFENDER_API_KEY': process.env.DEFENDER_API_KEY || 'ArjaqtuKsioJW62cJTKE82nL5npde2sB',
  'DEFENDER_API_SECRET': process.env.DEFENDER_API_SECRET,
  'DEFENDER_RELAYER_ADDRESS': process.env.DEFENDER_RELAYER_ADDRESS || '0x2ba190287a390cfa282E4B9aE57F758F28BA96d5',
  'DEFENDER_RELAYER_ID': process.env.DEFENDER_RELAYER_ID || 'ffd9488c-0af9-4c0a-8d3c-29e199a1c8c9',
  'DEFENDER_MINT_AUTOTASK_ID': process.env.DEFENDER_MINT_AUTOTASK_ID || '7d0bc3c1-7578-472e-afdf-8d03d4c6611b',
  'DEFENDER_TRANSFER_AUTOTASK_ID': process.env.DEFENDER_TRANSFER_AUTOTASK_ID || 'e9219e0c-c338-408e-b668-06cafb64cd1c',
  'DEFENDER_QUERY_AUTOTASK_ID': process.env.DEFENDER_QUERY_AUTOTASK_ID || '118413eb-f845-40c5-83da-288b32a1862a',
  
  'DEFENDER_MINT_WEBHOOK_URL': process.env.DEFENDER_MINT_WEBHOOK_URL,
  'DEFENDER_TRANSFER_WEBHOOK_URL': process.env.DEFENDER_TRANSFER_WEBHOOK_URL,
  'DEFENDER_QUERY_WEBHOOK_URL': process.env.DEFENDER_QUERY_WEBHOOK_URL,
  
  'PINATA_API_KEY': process.env.PINATA_API_KEY || 'f95bfdf8b3f6139ef103',
  'PINATA_SECRET_KEY': process.env.PINATA_SECRET_KEY,
  'PINATA_JWT': process.env.PINATA_JWT,
  'IPFS_GATEWAY': process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
  
  'MORALIS_API_KEY': process.env.MORALIS_API_KEY,
  
  'PRIVATE_KEY': process.env.PRIVATE_KEY,
  'ENCRYPTION_KEY': process.env.ENCRYPTION_KEY,
  
  'JWT_SECRET': process.env.JWT_SECRET || 'nft2025',
  'JWT_EXPIRES_IN': process.env.JWT_EXPIRES_IN || '7d',
  
  'NETWORK_NAME': process.env.NETWORK_NAME || 'polygon-amoy',
  'RPC_URL': process.env.RPC_URL || 'https://rpc-amoy.polygon.technology',
  'CHAIN_ID': process.env.CHAIN_ID || '80002',
  'BLOCK_EXPLORER': process.env.BLOCK_EXPLORER || 'https://amoy.polygonscan.com/',
  
  'POLYGON_RPC_URL': process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology',
  'POLYGONSCAN_API_KEY': process.env.POLYGONSCAN_API_KEY,
  
  'WEBHOOK_URL': process.env.WEBHOOK_URL || 'https://nft-market-api.netlify.app/api/webhook',
  'PORT': process.env.PORT || '8081',
  'NODE_ENV': process.env.NODE_ENV || 'production',
};

async function setupParameters() {
  console.log('🚀 Setting up AWS Parameter Store...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const [key, value] of Object.entries(parameters)) {
    if (!value) {
      console.log(`⚠️  Skipping ${key} (no value provided)`);
      continue;
    }

    try {
      const command = new PutParameterCommand({
        Name: `/netlify/${key}`,
        Value: value,
        Type: key.includes('KEY') || key.includes('SECRET') || key.includes('JWT') ? 'SecureString' : 'String',
        Overwrite: true,
        Description: `Environment variable for NFT Marketplace: ${key}`,
      });

      await ssmClient.send(command);
      console.log(`✅ Set parameter: ${key}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to set parameter ${key}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully set: ${successCount} parameters`);
  console.log(`❌ Failed: ${errorCount} parameters`);
  
  if (successCount > 0) {
    console.log(`\n🎉 AWS Parameter Store setup completed!`);
    console.log(`\nNext steps:`);
    console.log(`1. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Netlify dashboard`);
    console.log(`2. Deploy your Netlify functions`);
    console.log(`3. Functions will automatically load configuration from AWS Parameter Store`);
  }
}

// Check if AWS credentials are provided
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ AWS credentials not found!');
  console.error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
  console.error('\nExample:');
  console.error('export AWS_ACCESS_KEY_ID=your_access_key_id');
  console.error('export AWS_SECRET_ACCESS_KEY=your_secret_access_key');
  console.error('node scripts/setup-aws-parameters.js');
  process.exit(1);
}

setupParameters().catch(console.error);
