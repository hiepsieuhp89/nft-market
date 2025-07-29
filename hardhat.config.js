require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

module.exports = {
  solidity: {
    version: "0.8.20",
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
        process.env.PRIVATE_KEY ? `0x${process.env.PRIVATE_KEY}` : "0x" + "your_private_key_here",
      ],
      gasPrice: 35000000000, // 35 gwei
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [
        process.env.PRIVATE_KEY ? `0x${process.env.PRIVATE_KEY}` : "0x" + "your_private_key_here",
      ],
      gasPrice: 35000000000, // 35 gwei
    },
    amoy: {
      url: process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: [
        process.env.PRIVATE_KEY ? `0x${process.env.PRIVATE_KEY}` : "0x" + "your_private_key_here",
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
