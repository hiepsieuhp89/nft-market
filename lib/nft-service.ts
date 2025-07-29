import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import {
  mintNFT as blockchainMintNFT,
  transferNFT as blockchainTransferNFT,
  getNFTsByOwner,
  getTransactionDetails,
} from "./blockchain-service"
import { getNFTsByWallet, getNFTMetadata } from "./moralis-service"
import { saveTransaction } from "./transaction-service"
import { db } from "@/lib/firebase"

interface CreateNFTData {
  name: string
  price: number
  description: string
  imageUrl: string
  userId: string
  walletAddress: string
}

export const createNFT = async (data: CreateNFTData) => {
  try {
    // Prepare metadata for blockchain
    const metadata = {
      name: data.name,
      description: data.description,
      image: data.imageUrl,
      price: data.price,
      attributes: [
        {
          trait_type: "Creator",
          value: data.walletAddress,
        },
        {
          trait_type: "Created At",
          value: new Date().toISOString(),
        },
      ],
    }

    // Mint NFT on blockchain
    const mintResult = await blockchainMintNFT(data.walletAddress, metadata)

    // Save NFT metadata to Firestore
    const nftData = {
      name: data.name,
      price: data.price,
      description: data.description,
      imageUrl: data.imageUrl,
      userId: data.userId,
      walletAddress: data.walletAddress,
      tokenId: mintResult.tokenId,
      transactionHash: mintResult.transactionHash,
      blockNumber: mintResult.blockNumber,
      gasUsed: mintResult.gasUsed,
      createdAt: serverTimestamp(),
      isTransferred: false,
    }

    const docRef = await addDoc(collection(db, "nfts"), nftData)

    // Save transaction history
    await saveTransaction({
      userId: data.userId,
      walletAddress: data.walletAddress,
      type: "mint",
      tokenId: mintResult.tokenId,
      nftName: data.name,
      transactionHash: mintResult.transactionHash,
      blockNumber: mintResult.blockNumber,
      gasUsed: mintResult.gasUsed,
      status: "confirmed",
    })

    return {
      id: docRef.id,
      ...mintResult,
    }
  } catch (error: any) {
    // Save failed transaction
    try {
      await saveTransaction({
        userId: data.userId,
        walletAddress: data.walletAddress,
        type: "mint",
        nftName: data.name,
        transactionHash: "",
        blockNumber: 0,
        gasUsed: "0",
        status: "failed",
      })
    } catch (saveError) {
      console.error("Error saving failed transaction:", saveError)
    }

    console.error("Error creating NFT:", error)
    throw new Error(`Không thể tạo NFT: ${error.message}`)
  }
}

export const getNFTsByUser = async (userId: string, walletAddress?: string) => {
  try {
    // Get NFTs from Firestore
    const q = query(collection(db, "nfts"), where("userId", "==", userId), where("isTransferred", "==", false))
    const querySnapshot = await getDocs(q)

    const firestoreNFTs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // If wallet is connected, also get NFTs from Moralis
    if (walletAddress) {
      try {
        // Try Moralis first, fallback to direct blockchain
        let blockchainNFTs: any[] = []

        try {
          const moralisNFTs = await getNFTsByWallet(walletAddress)
          blockchainNFTs = moralisNFTs.result || []
        } catch (moralisError) {
          console.warn("Moralis unavailable, using direct blockchain:", moralisError)
          blockchainNFTs = await getNFTsByOwner(walletAddress)
        }

        // Merge blockchain data with Firestore data
        const mergedNFTs = firestoreNFTs.map((nft: any) => {
          const blockchainNFT = blockchainNFTs.find((bNft: any) => {
            const tokenId = bNft.token_id || bNft.tokenId
            return tokenId === nft.tokenId?.toString()
          })

          if (blockchainNFT) {
            return {
              ...nft,
              onChainPrice: blockchainNFT.price || blockchainNFT.amount,
              metadata: blockchainNFT.metadata,
              tokenURI: blockchainNFT.token_uri || blockchainNFT.tokenURI,
              moralisData: blockchainNFT,
            }
          }

          return nft
        })

        return mergedNFTs
      } catch (blockchainError) {
        console.error("Error fetching from blockchain services:", blockchainError)
        return firestoreNFTs
      }
    }

    return firestoreNFTs
  } catch (error: any) {
    console.error("Error fetching NFTs:", error)
    throw new Error("Không thể tải danh sách NFT.")
  }
}

export const transferNFT = async (nftId: string, recipientAddress: string, senderAddress: string) => {
  try {
    // Get NFT data from Firestore
    const nftQuery = query(collection(db, "nfts"), where("__name__", "==", nftId))
    const nftSnapshot = await getDocs(nftQuery)

    if (nftSnapshot.empty) {
      throw new Error("NFT không tồn tại")
    }

    const nftData = nftSnapshot.docs[0].data()
    const tokenId = nftData.tokenId

    if (!tokenId) {
      throw new Error("Token ID không hợp lệ")
    }

    // Transfer NFT on blockchain
    const transferResult = await blockchainTransferNFT(tokenId, recipientAddress)

    // Update NFT ownership in Firestore
    const nftRef = doc(db, "nfts", nftId)
    await updateDoc(nftRef, {
      isTransferred: true,
      transferredTo: recipientAddress,
      transferredAt: serverTimestamp(),
      transferTransactionHash: transferResult.transactionHash,
      transferBlockNumber: transferResult.blockNumber,
      transferGasUsed: transferResult.gasUsed,
    })

    // Save transaction history
    await saveTransaction({
      userId: nftData.userId,
      walletAddress: senderAddress,
      type: "transfer",
      tokenId: tokenId,
      nftName: nftData.name,
      transactionHash: transferResult.transactionHash,
      blockNumber: transferResult.blockNumber,
      gasUsed: transferResult.gasUsed,
      from: senderAddress,
      to: recipientAddress,
      status: "confirmed",
    })

    return transferResult
  } catch (error: any) {
    console.error("Error transferring NFT:", error)
    throw new Error(`Không thể chuyển NFT: ${error.message}`)
  }
}

// Get transaction status
export const getTransactionStatus = async (txHash: string) => {
  try {
    return await getTransactionDetails(txHash)
  } catch (error: any) {
    console.error("Error getting transaction status:", error)
    throw new Error(`Không thể lấy thông tin giao dịch: ${error.message}`)
  }
}
