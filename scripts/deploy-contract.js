const { ethers } = require("hardhat")

async function main() {
  const hre = require("hardhat") // Declare hre variable
  const network = hre.network // Declare network variable
  const [deployer] = await ethers.getSigners()

  console.log("🚀 Deploying NFT Marketplace contract...")
  console.log("📍 Network:", network.name)
  console.log("👤 Deployer address:", deployer.address)
  console.log("💰 Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "MATIC")
  console.log("=" .repeat(50))

  // Get the contract factory
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace")

  // Deploy the contract
  console.log("⏳ Deploying contract...")
  const nftMarketplace = await NFTMarketplace.deploy()

  // Wait for deployment to complete
  await nftMarketplace.waitForDeployment()

  const address = await nftMarketplace.getAddress()
  const deployTx = nftMarketplace.deploymentTransaction()

  console.log("✅ NFT Marketplace deployed successfully!")
  console.log("📍 Contract address:", address)
  console.log("🔗 Transaction hash:", deployTx.hash)
  console.log("⛽ Gas used:", deployTx.gasLimit.toString())
  console.log("🌐 Block explorer:", `https://amoy.polygonscan.com/address/${address}`)
  console.log("=" .repeat(50))

  // Verify the contract on Polygonscan (optional)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...")
    await nftMarketplace.deploymentTransaction().wait(6)

    console.log("🔍 Verifying contract on Polygonscan...")
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      })
      console.log("✅ Contract verified successfully!")
      console.log("🔗 Verified contract:", `https://amoy.polygonscan.com/address/${address}#code`)
    } catch (error) {
      console.log("❌ Verification failed:", error.message)
      if (error.message.includes("API Key")) {
        console.log("💡 Make sure POLYGONSCAN_API_KEY is set in your .env file")
      }
    }
  }

  // Save deployment info
  console.log("\n📝 Next steps:")
  console.log("1. Update your .env file:")
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`)
  console.log("2. Run: npm run validate")
  console.log("3. Run: npm run dev")
  console.log("=" .repeat(50))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
