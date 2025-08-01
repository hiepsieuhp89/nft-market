// Hardhat deployment script for NFT Marketplace
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying NFT Marketplace Contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📍 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");

  if (balance === 0n) {
    throw new Error("❌ Insufficient balance. Please fund your wallet with MATIC.");
  }

  // Deploy the contract
  console.log("\n📦 Deploying NFTMarketplace contract...");
  
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  
  // Wait for deployment
  await nftMarketplace.waitForDeployment();
  
  const contractAddress = await nftMarketplace.getAddress();
  
  console.log("✅ NFTMarketplace deployed to:", contractAddress);
  
  // Verify contract details
  console.log("\n🔍 Verifying contract...");
  const name = await nftMarketplace.name();
  const symbol = await nftMarketplace.symbol();
  
  console.log("📛 Contract Name:", name);
  console.log("🔤 Symbol:", symbol);
  console.log("👤 Owner:", await nftMarketplace.owner());

  // Update .env files with new contract address
  console.log("\n📝 Updating environment files...");
  
  // Update main .env
  const mainEnvPath = path.join(__dirname, '../.env');
  if (fs.existsSync(mainEnvPath)) {
    let envContent = fs.readFileSync(mainEnvPath, 'utf8');
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
    );
    fs.writeFileSync(mainEnvPath, envContent);
    console.log("✅ Updated main .env file");
  }

  // Update backend .env
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  if (fs.existsSync(backendEnvPath)) {
    let envContent = fs.readFileSync(backendEnvPath, 'utf8');
    envContent = envContent.replace(
      /CONTRACT_ADDRESS=.*/,
      `CONTRACT_ADDRESS=${contractAddress}`
    );
    fs.writeFileSync(backendEnvPath, envContent);
    console.log("✅ Updated backend .env file");
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: "polygon-amoy",
    deployedAt: new Date().toISOString(),
    transactionHash: nftMarketplace.deploymentTransaction()?.hash,
    blockNumber: await ethers.provider.getBlockNumber()
  };

  const deploymentPath = path.join(__dirname, '../deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Saved deployment info to deployment.json");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: Polygon Amoy`);
  console.log(`Explorer: https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log(`Transaction: https://amoy.polygonscan.com/tx/${nftMarketplace.deploymentTransaction()?.hash}`);

  console.log("\n🔧 Next steps:");
  console.log("1. Verify contract on Polygonscan (optional)");
  console.log("2. Update Autotask secrets with new contract address");
  console.log("3. Test minting NFTs");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
