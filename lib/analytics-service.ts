/**
 * Analytics Service - Using Moralis instead of The Graph
 * Provides analytics and statistics for the NFT marketplace
 */

import { getNFTsByWallet, getNFTTransfers, getContractEvents } from "./moralis-service"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Types for analytics data
interface NFTAnalytics {
  totalNFTs: number
  totalUsers: number
  totalTransactions: number
  totalVolume: string
  recentNFTs: any[]
  topCreators: any[]
}

interface UserAnalytics {
  totalNFTsCreated: number
  totalNFTsOwned: number
  totalTransactions: number
  ownedNFTs: any[]
  createdNFTs: any[]
  recentTransactions: any[]
}

/**
 * Get global marketplace analytics
 */
export const getGlobalAnalytics = async (): Promise<NFTAnalytics> => {
  try {
    // Get data from Firestore for basic stats
    const nftsSnapshot = await getDocs(collection(db, "nfts"))
    const transactionsSnapshot = await getDocs(collection(db, "transactions"))
    
    const totalNFTs = nftsSnapshot.size
    const totalTransactions = transactionsSnapshot.size
    
    // Get unique users count
    const userIds = new Set()
    nftsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.userId) userIds.add(data.userId)
    })
    const totalUsers = userIds.size

    // Calculate total volume from transactions
    let totalVolume = 0
    transactionsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.type === "mint" && data.price) {
        totalVolume += parseFloat(data.price) || 0
      }
    })

    // Get recent NFTs
    const recentNFTsQuery = query(
      collection(db, "nfts"),
      orderBy("createdAt", "desc"),
      limit(10)
    )
    const recentNFTsSnapshot = await getDocs(recentNFTsQuery)
    const recentNFTs = recentNFTsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Get top creators (by NFT count)
    const creatorCounts: { [key: string]: number } = {}
    nftsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.walletAddress) {
        creatorCounts[data.walletAddress] = (creatorCounts[data.walletAddress] || 0) + 1
      }
    })

    const topCreators = Object.entries(creatorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([address, count]) => ({ address, nftCount: count }))

    return {
      totalNFTs,
      totalUsers,
      totalTransactions,
      totalVolume: totalVolume.toString(),
      recentNFTs,
      topCreators
    }
  } catch (error) {
    console.error("Error getting global analytics:", error)
    throw error
  }
}

/**
 * Get user-specific analytics
 */
export const getUserAnalytics = async (userId: string, walletAddress?: string): Promise<UserAnalytics> => {
  try {
    // Get user's NFTs from Firestore
    const userNFTsQuery = query(collection(db, "nfts"), where("userId", "==", userId))
    const userNFTsSnapshot = await getDocs(userNFTsQuery)
    
    const createdNFTs = userNFTsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Get user's transactions
    const userTransactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(20)
    )
    const userTransactionsSnapshot = await getDocs(userTransactionsQuery)
    const recentTransactions = userTransactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    let ownedNFTs: any[] = []
    
    // If wallet address is provided, get owned NFTs from Moralis
    if (walletAddress) {
      try {
        const moralisNFTs = await getNFTsByWallet(walletAddress)
        ownedNFTs = moralisNFTs.result || []
      } catch (moralisError) {
        console.warn("Could not fetch owned NFTs from Moralis:", moralisError)
        // Fallback to Firestore data
        ownedNFTs = createdNFTs.filter((nft: any) => !nft.isTransferred)
      }
    }

    return {
      totalNFTsCreated: createdNFTs.length,
      totalNFTsOwned: ownedNFTs.length,
      totalTransactions: recentTransactions.length,
      ownedNFTs,
      createdNFTs,
      recentTransactions
    }
  } catch (error) {
    console.error("Error getting user analytics:", error)
    throw error
  }
}

/**
 * Get NFT transfer history using Moralis
 */
export const getNFTTransferHistory = async (contractAddress: string, tokenId?: string) => {
  try {
    const transfers = await getNFTTransfers(contractAddress, tokenId)
    
    // Format transfers for display
    return transfers.map((transfer: any) => ({
      id: transfer.transaction_hash,
      blockNumber: transfer.block_number,
      blockTimestamp: transfer.block_timestamp,
      transactionHash: transfer.transaction_hash,
      from: transfer.from_address,
      to: transfer.to_address,
      tokenId: transfer.token_id,
      amount: transfer.amount || "1"
    }))
  } catch (error) {
    console.error("Error getting NFT transfer history:", error)
    return []
  }
}

/**
 * Get contract events using Moralis
 */
export const getContractAnalytics = async (contractAddress: string) => {
  try {
    // Get mint events
    const mintEvents = await getContractEvents(contractAddress, "NFTMinted")
    
    // Get transfer events  
    const transferEvents = await getContractEvents(contractAddress, "NFTTransferred")

    return {
      totalMints: mintEvents.length,
      totalTransfers: transferEvents.length,
      recentMints: mintEvents.slice(0, 10),
      recentTransfers: transferEvents.slice(0, 10)
    }
  } catch (error) {
    console.error("Error getting contract analytics:", error)
    return {
      totalMints: 0,
      totalTransfers: 0,
      recentMints: [],
      recentTransfers: []
    }
  }
}

/**
 * Real-time analytics subscription using polling
 * Replaces The Graph WebSocket subscriptions
 */
export const subscribeToAnalytics = (callback: (data: any) => void) => {
  const pollInterval = 10000 // 10 seconds

  const poll = async () => {
    try {
      const analytics = await getGlobalAnalytics()
      callback(analytics)
    } catch (error) {
      console.error("Error polling analytics:", error)
    }
  }

  // Initial call
  poll()

  // Set up polling
  const intervalId = setInterval(poll, pollInterval)

  // Return cleanup function
  return () => clearInterval(intervalId)
}

/**
 * Search NFTs by various criteria
 */
export const searchNFTs = async (searchTerm: string, filters?: {
  creator?: string
  priceRange?: { min: number, max: number }
  limit?: number
}) => {
  try {
    let nftsQuery = collection(db, "nfts")
    
    // Apply filters
    if (filters?.creator) {
      nftsQuery = query(nftsQuery, where("walletAddress", "==", filters.creator))
    }

    const snapshot = await getDocs(nftsQuery)
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Filter by search term
    if (searchTerm) {
      results = results.filter((nft: any) => 
        nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by price range
    if (filters?.priceRange) {
      results = results.filter((nft: any) => {
        const price = parseFloat(nft.price) || 0
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max
      })
    }

    // Apply limit
    if (filters?.limit) {
      results = results.slice(0, filters.limit)
    }

    return results
  } catch (error) {
    console.error("Error searching NFTs:", error)
    return []
  }
}
