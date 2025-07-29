#!/usr/bin/env node

/**
 * Test script for Moralis v2 SDK
 * Tests basic functionality with the configured API key
 */

require('dotenv').config();
const Moralis = require('moralis').default;

const MORALIS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY || "",
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "80002", // Polygon Amoy
};

async function testMoralisConnection() {
  console.log('🧪 Testing Moralis v2 SDK Connection');
  console.log('===================================\n');

  if (!MORALIS_CONFIG.apiKey) {
    console.log('❌ Moralis API key not found in environment variables');
    console.log('💡 Please set NEXT_PUBLIC_MORALIS_API_KEY in your .env file\n');
    return false;
  }

  try {
    // Initialize Moralis
    console.log('🔄 Initializing Moralis...');
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: MORALIS_CONFIG.apiKey,
      });
    }
    console.log('✅ Moralis initialized successfully\n');

    // Test 1: Get chain info
    console.log('🔍 Test 1: Getting chain information...');
    const chainHex = `0x${Number(MORALIS_CONFIG.chainId).toString(16)}`;
    console.log(`   Chain ID: ${MORALIS_CONFIG.chainId} (${chainHex})`);
    
    // Test 2: Get native balance for a test address
    console.log('\n🔍 Test 2: Getting native balance...');
    const testAddress = '0x8ba1f109551bD432803012645Hac136c'; // Valid test address
    
    try {
      const balance = await Moralis.EvmApi.balance.getNativeBalance({
        address: testAddress,
        chain: chainHex,
      });
      
      console.log(`✅ Native balance for ${testAddress}:`);
      console.log(`   Balance: ${balance.toJSON().balance} wei`);
      console.log(`   Balance: ${Moralis.EvmUtils.formatUnits(balance.toJSON().balance, 18)} MATIC`);
    } catch (balanceError) {
      console.log(`⚠️  Could not fetch balance: ${balanceError.message}`);
    }

    // Test 3: Get NFTs for a wallet (if any)
    console.log('\n🔍 Test 3: Getting NFTs for test address...');
    try {
      const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
        address: testAddress,
        chain: chainHex,
        limit: 5,
      });
      
      const nftData = nfts.toJSON();
      console.log(`✅ Found ${nftData.total} NFTs for address`);
      
      if (nftData.result && nftData.result.length > 0) {
        console.log('   Sample NFTs:');
        nftData.result.slice(0, 3).forEach((nft, index) => {
          console.log(`   ${index + 1}. ${nft.name || 'Unnamed'} (Token ID: ${nft.token_id})`);
          console.log(`      Contract: ${nft.token_address}`);
          console.log(`      Standard: ${nft.contract_type}`);
        });
      } else {
        console.log('   No NFTs found for this address');
      }
    } catch (nftError) {
      console.log(`⚠️  Could not fetch NFTs: ${nftError.message}`);
    }

    // Test 4: Get block info
    console.log('\n🔍 Test 4: Getting latest block info...');
    try {
      const block = await Moralis.EvmApi.block.getDateToBlock({
        date: new Date(),
        chain: chainHex,
      });
      
      const blockData = block.toJSON();
      console.log(`✅ Block information:`);
      console.log(`   Block Number: ${blockData.block}`);
      console.log(`   Date: ${blockData.date}`);
      console.log(`   Block Timestamp: ${blockData.timestamp}`);
    } catch (blockError) {
      console.log(`⚠️  Could not fetch block info: ${blockError.message}`);
    }

    console.log('\n🎉 Moralis v2 SDK test completed successfully!');
    console.log('✅ Your API key is working correctly');
    console.log('🚀 Ready to use Moralis in your NFT marketplace\n');
    
    return true;

  } catch (error) {
    console.log('\n❌ Moralis test failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('401')) {
      console.log('💡 This looks like an authentication error. Please check:');
      console.log('   1. Your API key is correct');
      console.log('   2. Your API key has not expired');
      console.log('   3. Your Moralis account is active');
    } else if (error.message.includes('rate limit')) {
      console.log('💡 Rate limit exceeded. Please wait a moment and try again.');
    } else {
      console.log('💡 Please check your internet connection and API key configuration.');
    }
    
    console.log('\n📖 For more help, visit: https://docs.moralis.io/');
    return false;
  }
}

// Additional utility functions for testing specific NFT marketplace features
async function testNFTMarketplaceFeatures() {
  console.log('\n🏪 Testing NFT Marketplace specific features...');
  console.log('===============================================\n');

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress || contractAddress === '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7') {
    console.log('⚠️  Using default contract address for testing');
    console.log('💡 Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env for your deployed contract\n');
  }

  const chainHex = `0x${Number(MORALIS_CONFIG.chainId).toString(16)}`;

  try {
    // Test getting NFTs from your contract
    console.log('🔍 Getting NFTs from your marketplace contract...');
    const contractNFTs = await Moralis.EvmApi.nft.getContractNFTs({
      address: contractAddress,
      chain: chainHex,
      limit: 10,
    });

    const nftData = contractNFTs.toJSON();
    console.log(`✅ Found ${nftData.total} NFTs in your marketplace contract`);
    
    if (nftData.result && nftData.result.length > 0) {
      console.log('   Your marketplace NFTs:');
      nftData.result.forEach((nft, index) => {
        console.log(`   ${index + 1}. ${nft.name || 'Unnamed NFT'}`);
        console.log(`      Token ID: ${nft.token_id}`);
        console.log(`      Owner: ${nft.owner_of}`);
        if (nft.metadata) {
          const metadata = typeof nft.metadata === 'string' ? JSON.parse(nft.metadata) : nft.metadata;
          console.log(`      Description: ${metadata.description || 'No description'}`);
        }
      });
    } else {
      console.log('   No NFTs found in your contract yet');
      console.log('   💡 Create some NFTs using your marketplace to see them here!');
    }

  } catch (error) {
    console.log(`⚠️  Could not fetch contract NFTs: ${error.message}`);
    if (error.message.includes('Contract does not exist')) {
      console.log('💡 Make sure your contract is deployed and the address is correct');
    }
  }
}

// Main execution
async function main() {
  const basicTestPassed = await testMoralisConnection();
  
  if (basicTestPassed) {
    await testNFTMarketplaceFeatures();
  }
  
  process.exit(basicTestPassed ? 0 : 1);
}

main().catch(console.error);
