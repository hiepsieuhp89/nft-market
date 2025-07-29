import { ethers } from "ethers"
import { CONTRACT_CONFIG, IPFS_CONFIG } from "./contract-config"

// Get Web3 provider
export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  throw new Error("MetaMask not found")
}

// Get contract instance
export const getContract = async () => {
  const provider = getProvider()
  const signer = await provider.getSigner()
  return new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, signer)
}

// Upload metadata to IPFS
export const uploadToIPFS = async (metadata: any) => {
  try {
    const response = await fetch(IPFS_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: IPFS_CONFIG.apiKey,
        pinata_secret_api_key: IPFS_CONFIG.secretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `NFT-${metadata.name}`,
        },
      }),
    })

    const result = await response.json()
    return `${IPFS_CONFIG.gateway}${result.IpfsHash}`
  } catch (error) {
    console.error("Error uploading to IPFS:", error)
    // Fallback: create a data URL for demo purposes
    return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
  }
}

// Mint NFT on blockchain
export const mintNFT = async (
  walletAddress: string,
  metadata: {
    name: string
    description: string
    image: string
    price: number
  },
) => {
  try {
    const contract = await getContract()

    // Upload metadata to IPFS
    const tokenURI = await uploadToIPFS(metadata)

    // Convert price to wei (MATIC has 18 decimals)
    const priceInWei = ethers.parseEther(metadata.price.toString())

    // Call smart contract mint function
    const transaction = await contract.mintNFT(walletAddress, tokenURI, priceInWei)

    // Wait for transaction confirmation
    const receipt = await transaction.wait()

    // Extract token ID from events
    const mintEvent = receipt.logs.find((log: any) => {
      try {
        const parsedLog = contract.interface.parseLog(log)
        return parsedLog?.name === "NFTMinted"
      } catch {
        return false
      }
    })

    let tokenId = null
    if (mintEvent) {
      const parsedLog = contract.interface.parseLog(mintEvent)
      tokenId = parsedLog?.args?.tokenId?.toString()
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (error: any) {
    console.error("Error minting NFT:", error)
    throw new Error(`Minting failed: ${error.message}`)
  }
}

// Transfer NFT on blockchain
export const transferNFT = async (tokenId: string, recipientAddress: string) => {
  try {
    const contract = await getContract()

    // Call smart contract transfer function
    const transaction = await contract.transferNFT(recipientAddress, tokenId)

    // Wait for transaction confirmation
    const receipt = await transaction.wait()

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (error: any) {
    console.error("Error transferring NFT:", error)
    throw new Error(`Transfer failed: ${error.message}`)
  }
}

// Get NFTs owned by address
export const getNFTsByOwner = async (ownerAddress: string) => {
  try {
    const contract = await getContract()

    // Get token IDs owned by the address
    const tokenIds = await contract.getTokensByOwner(ownerAddress)

    // Get details for each token
    const nfts = await Promise.all(
      tokenIds.map(async (tokenId: bigint) => {
        try {
          const tokenURI = await contract.tokenURI(tokenId)
          const price = await contract.tokenPrices(tokenId)
          const creator = await contract.tokenCreators(tokenId)

          // Fetch metadata from IPFS/URI
          let metadata = {}
          try {
            if (tokenURI.startsWith("data:")) {
              // Handle data URL
              const base64Data = tokenURI.split(",")[1]
              metadata = JSON.parse(atob(base64Data))
            } else {
              // Handle IPFS URL
              const response = await fetch(tokenURI)
              metadata = await response.json()
            }
          } catch (metadataError) {
            console.error("Error fetching metadata:", metadataError)
            metadata = { name: "Unknown", description: "Metadata unavailable" }
          }

          return {
            tokenId: tokenId.toString(),
            price: ethers.formatEther(price),
            creator,
            tokenURI,
            metadata,
          }
        } catch (error) {
          console.error(`Error fetching token ${tokenId}:`, error)
          return null
        }
      }),
    )

    return nfts.filter((nft) => nft !== null)
  } catch (error: any) {
    console.error("Error getting NFTs by owner:", error)
    throw new Error(`Failed to fetch NFTs: ${error.message}`)
  }
}

// Get transaction details
export const getTransactionDetails = async (txHash: string) => {
  try {
    const provider = getProvider()
    const transaction = await provider.getTransaction(txHash)
    const receipt = await provider.getTransactionReceipt(txHash)

    return {
      transaction,
      receipt,
      explorerUrl: `${CONTRACT_CONFIG.network.blockExplorer}/tx/${txHash}`,
    }
  } catch (error: any) {
    console.error("Error getting transaction details:", error)
    throw new Error(`Failed to fetch transaction: ${error.message}`)
  }
}

// Check if wallet is connected to correct network
export const checkNetwork = async () => {
  try {
    const provider = getProvider()
    const network = await provider.getNetwork()

    if (Number(network.chainId) !== CONTRACT_CONFIG.network.chainId) {
      throw new Error(`Please switch to ${CONTRACT_CONFIG.network.name} network`)
    }

    return true
  } catch (error: any) {
    console.error("Network check failed:", error)
    throw error
  }
}
