// Test direct minting to the deployed contract
require('dotenv').config();
const { ethers } = require('ethers');

async function testDirectMint() {
  console.log('🎨 Testing Direct NFT Minting...\n');

  try {
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`📍 Minting from: ${wallet.address}`);
    console.log(`🏪 Contract: ${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} MATIC`);

    // Contract ABI (minimal for testing)
    const contractABI = [
      {
        "inputs": [
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "string", "name": "uri", "type": "string"},
          {"internalType": "uint256", "name": "price", "type": "uint256"}
        ],
        "name": "mintNFT",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
          {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
          {"indexed": false, "internalType": "string", "name": "tokenURI", "type": "string"},
          {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"}
        ],
        "name": "NFTMinted",
        "type": "event"
      }
    ];

    // Create contract instance
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      contractABI,
      wallet
    );

    // Verify contract
    console.log('\n🔍 Verifying contract...');
    const contractName = await contract.name();
    console.log(`📛 Contract Name: ${contractName}`);

    // Test mint NFT
    console.log('\n🎨 Minting test NFT...');
    
    const testMetadata = {
      name: "Test NFT #1",
      description: "This is a test NFT minted directly to the contract",
      image: "https://gateway.pinata.cloud/ipfs/QmTestImage",
      attributes: [
        { trait_type: "Type", value: "Test" },
        { trait_type: "Rarity", value: "Common" }
      ]
    };

    // For testing, we'll use a simple metadata URI
    const tokenURI = "https://gateway.pinata.cloud/ipfs/QmTestMetadata";
    const price = ethers.parseEther("0.01"); // 0.01 MATIC
    const recipient = wallet.address; // Mint to ourselves

    console.log(`👤 Recipient: ${recipient}`);
    console.log(`🔗 Token URI: ${tokenURI}`);
    console.log(`💰 Price: ${ethers.formatEther(price)} MATIC`);

    // Estimate gas
    const gasEstimate = await contract.mintNFT.estimateGas(recipient, tokenURI, price);
    console.log(`⛽ Estimated Gas: ${gasEstimate.toString()}`);

    // Mint NFT with lower gas price
    console.log('\n🚀 Sending mint transaction...');
    const tx = await contract.mintNFT(recipient, tokenURI, price, {
      gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
      gasPrice: ethers.parseUnits('30', 'gwei') // Lower gas price
    });

    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log(`🔗 Explorer: https://amoy.polygonscan.com/tx/${tx.hash}`);

    // Wait for confirmation
    console.log('\n⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

    // Extract token ID from events
    let tokenId = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog.name === 'NFTMinted') {
          tokenId = parsedLog.args.tokenId.toString();
          console.log(`🎯 Token ID: ${tokenId}`);
          break;
        }
      } catch (e) {
        // Skip logs that don't match our interface
      }
    }

    console.log('\n🎉 NFT Minted Successfully!');
    console.log(`📋 Summary:`);
    console.log(`- Token ID: ${tokenId}`);
    console.log(`- Owner: ${recipient}`);
    console.log(`- Contract: ${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`);
    console.log(`- Network: Polygon Amoy`);

  } catch (error) {
    console.error('❌ Minting failed:', error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('\n💡 Solution: Add more MATIC to your wallet');
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      console.log('\n💡 Solution: Check contract address and network');
    }
  }
}

testDirectMint();
