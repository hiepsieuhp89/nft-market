// Check if smart contract is deployed and working
require('dotenv').config();
const { ethers } = require('ethers');

async function checkContract() {
  console.log('🔍 Checking Smart Contract...\n');

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || process.env.POLYGON_RPC_URL);
    const contractAddress = process.env.CONTRACT_ADDRESS;

    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 RPC URL: ${process.env.RPC_URL || process.env.POLYGON_RPC_URL}`);

    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      console.log('❌ Contract not deployed at this address');
      console.log('\n🚀 Need to deploy contract first!');
      return false;
    } else {
      console.log('✅ Contract found at address');
      console.log(`📝 Contract bytecode length: ${code.length} characters`);
      
      // Try to get contract name (if it has a name function)
      try {
        const contract = new ethers.Contract(contractAddress, [
          "function name() view returns (string)",
          "function symbol() view returns (string)",
          "function totalSupply() view returns (uint256)"
        ], provider);
        
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        
        console.log(`📛 Contract Name: ${name}`);
        console.log(`🔤 Symbol: ${symbol}`);
        console.log(`📊 Total Supply: ${totalSupply.toString()}`);
      } catch (e) {
        console.log('ℹ️ Could not read contract details (normal for some contracts)');
      }
      
      return true;
    }

  } catch (error) {
    console.error('❌ Error checking contract:', error.message);
    return false;
  }
}

checkContract();
