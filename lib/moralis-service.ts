import Moralis from "moralis"

// Moralis configuration from environment variables
const MORALIS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY || "",
  serverUrl: process.env.NEXT_PUBLIC_MORALIS_SERVER_URL || "",
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "80002", // Polygon Amoy
}

// Initialize Moralis
export const initializeMoralis = async () => {
  try {
    if (!MORALIS_CONFIG.apiKey) {
      throw new Error("Moralis API key not configured")
    }

    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: MORALIS_CONFIG.apiKey,
      })
    }
  } catch (error) {
    console.error("Error initializing Moralis:", error)
    throw error
  }
}

// Get NFT metadata from Moralis
export const getNFTMetadata = async (address: string, tokenId: string) => {
  try {
    await initializeMoralis()

    const chainHex = `0x${Number(MORALIS_CONFIG.chainId).toString(16)}`
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      address,
      tokenId,
      chain: chainHex,
    })

    return response?.toJSON() || null
  } catch (error) {
    console.error("Error fetching NFT metadata:", error)
    throw error
  }
}

// Get NFTs by wallet address
export const getNFTsByWallet = async (walletAddress: string) => {
  try {
    await initializeMoralis()

    const chainHex = `0x${Number(MORALIS_CONFIG.chainId).toString(16)}`
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: walletAddress,
      chain: chainHex,
      limit: 100,
    })

    return response?.toJSON() || []
  } catch (error) {
    console.error("Error fetching wallet NFTs:", error)
    throw error
  }
}

// Get NFT transfers
export const getNFTTransfers = async (address: string, tokenId?: string) => {
  try {
    await initializeMoralis()

    const chainHex = `0x${Number(MORALIS_CONFIG.chainId).toString(16)}`
    const params: any = {
      address,
      chain: chainHex,
      limit: 100,
    }

    if (tokenId) {
      params.tokenId = tokenId
    }

    const response = await Moralis.EvmApi.nft.getNFTTransfers(params)

    return response?.toJSON() || []
  } catch (error) {
    console.error("Error fetching NFT transfers:", error)
    throw error
  }
}

// Get contract events
export const getContractEvents = async (address: string, topic: string) => {
  try {
    await initializeMoralis()

    const chainHex = `0x${Number(MORALIS_CONFIG.chainId).toString(16)}`

    // Basic ABI for common events
    const basicAbi = [
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
          { indexed: true, internalType: "address", name: "creator", type: "address" },
          { indexed: false, internalType: "string", name: "tokenURI", type: "string" },
          { indexed: false, internalType: "uint256", name: "price", type: "uint256" }
        ],
        name: "NFTMinted",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
          { indexed: true, internalType: "address", name: "from", type: "address" },
          { indexed: true, internalType: "address", name: "to", type: "address" }
        ],
        name: "NFTTransferred",
        type: "event"
      }
    ]

    const response = await Moralis.EvmApi.events.getContractEvents({
      address,
      chain: chainHex,
      topic,
      abi: basicAbi as any, // Type assertion for Moralis ABI compatibility
      limit: 100,
    })

    return response?.toJSON() || []
  } catch (error) {
    console.error("Error fetching contract events:", error)
    throw error
  }
}

// Stream configuration for real-time events
export const createEventStream = async (contractAddress: string) => {
  try {
    await initializeMoralis()

    const chainHex = `0x${Number(MORALIS_CONFIG.chainId).toString(16)}`
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`

    const stream = {
      chains: [chainHex],
      description: "NFT Marketplace Events",
      tag: "nft-marketplace",
      webhookUrl,
      includeContractLogs: true,
      includeNativeTxs: true,
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "string",
              name: "tokenURI",
              type: "string",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "price",
              type: "uint256",
            },
          ],
          name: "NFTMinted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "NFTTransferred",
          type: "event",
        },
      ],
      advancedOptions: [
        {
          topic0: "NFTMinted(uint256,address,string,uint256)",
          filter: { eq: ["address", contractAddress] },
          includeNativeTxs: true,
        },
        {
          topic0: "NFTTransferred(uint256,address,address)",
          filter: { eq: ["address", contractAddress] },
          includeNativeTxs: true,
        },
      ],
    }

    // Note: This would typically be done via Moralis admin panel or API
    console.log("Stream configuration:", stream)
    return stream
  } catch (error) {
    console.error("Error creating event stream:", error)
    throw error
  }
}
