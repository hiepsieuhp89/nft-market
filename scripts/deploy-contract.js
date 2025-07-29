const { ethers } = require("hardhat")

async function main() {
  const hre = require("hardhat") // Declare hre variable
  const network = hre.network // Declare network variable

  console.log("Deploying NFT Marketplace contract...")

  // Get the contract factory
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace")

  // Deploy the contract
  const nftMarketplace = await NFTMarketplace.deploy()

  // Wait for deployment to complete
  await nftMarketplace.deployed()

  console.log("NFT Marketplace deployed to:", nftMarketplace.address)
  console.log("Transaction hash:", nftMarketplace.deployTransaction.hash)

  // Verify the contract on Polygonscan (optional)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...")
    await nftMarketplace.deployTransaction.wait(6)

    console.log("Verifying contract...")
    try {
      await hre.run("verify:verify", {
        address: nftMarketplace.address,
        constructorArguments: [],
      })
    } catch (error) {
      console.log("Verification failed:", error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
