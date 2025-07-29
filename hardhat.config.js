require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: [
        // Add your private key here (use environment variables in production)
        "0x" + "your_private_key_here",
      ],
      gasPrice: 35000000000, // 35 gwei
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [
        // Add your private key here (use environment variables in production)
        "0x" + "your_private_key_here",
      ],
      gasPrice: 35000000000, // 35 gwei
    },
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: [
        // Add your private key here (use environment variables in production)
        "0x" + "your_private_key_here",
      ],
      gasPrice: 35000000000, // 35 gwei
    },
  },
  etherscan: {
    apiKey: {
      polygon: "your_polygonscan_api_key",
      polygonMumbai: "your_polygonscan_api_key",
      polygonAmoy: "your_polygonscan_api_key",
    },
  },
}
