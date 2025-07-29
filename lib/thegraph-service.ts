import { request, gql } from "graphql-request"

// The Graph endpoint from environment variables
const SUBGRAPH_URL = process.env.NEXT_PUBLIC_GRAPH_API_URL || "https://api.studio.thegraph.com/query/your-subgraph-id/nft-marketplace-polygon/version/latest"

// GraphQL queries
const GET_NFTS_QUERY = gql`
  query GetNFTs($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
    nfts(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      tokenId
      name
      description
      image
      tokenURI
      price
      createdAt
      updatedAt
      creator {
        id
        address
      }
      owner {
        id
        address
      }
      transactions {
        id
        type
        blockTimestamp
        transactionHash
      }
    }
  }
`

const GET_USER_NFTS_QUERY = gql`
  query GetUserNFTs($userId: String!) {
    user(id: $userId) {
      id
      address
      totalNFTsCreated
      totalNFTsOwned
      totalTransactions
      ownedNFTs {
        id
        tokenId
        name
        description
        image
        tokenURI
        price
        createdAt
        creator {
          id
          address
        }
      }
      createdNFTs {
        id
        tokenId
        name
        description
        image
        tokenURI
        price
        createdAt
        owner {
          id
          address
        }
      }
    }
  }
`

const GET_TRANSACTIONS_QUERY = gql`
  query GetTransactions($first: Int!, $skip: Int!, $userId: String) {
    transactions(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
      where: { user: $userId }
    ) {
      id
      type
      blockNumber
      blockTimestamp
      transactionHash
      gasUsed
      gasPrice
      price
      nft {
        id
        tokenId
        name
        image
      }
      user {
        id
        address
      }
      from {
        id
        address
      }
      to {
        id
        address
      }
    }
  }
`

const GET_TRANSFERS_QUERY = gql`
  query GetTransfers($first: Int!, $skip: Int!, $nftId: String) {
    transfers(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
      where: { nft: $nftId }
    ) {
      id
      blockNumber
      blockTimestamp
      transactionHash
      gasUsed
      nft {
        id
        tokenId
        name
      }
      from {
        id
        address
      }
      to {
        id
        address
      }
    }
  }
`

const GET_GLOBAL_STATS_QUERY = gql`
  query GetGlobalStats {
    globalStats(id: "global") {
      id
      totalNFTs
      totalUsers
      totalTransactions
      totalVolume
      lastUpdated
    }
  }
`

// Service functions
export const fetchNFTs = async (first = 10, skip = 0, orderBy = "createdAt", orderDirection = "desc") => {
  try {
    if (!SUBGRAPH_URL.includes("your-subgraph-id")) {
      const data = await request(SUBGRAPH_URL, GET_NFTS_QUERY, {
        first,
        skip,
        orderBy,
        orderDirection,
      })
      return (data as any).nfts
    } else {
      console.warn("The Graph subgraph URL not configured, returning empty array")
      return []
    }
  } catch (error) {
    console.error("Error fetching NFTs from The Graph:", error)
    throw error
  }
}

export const fetchUserNFTs = async (userId: string) => {
  try {
    if (!SUBGRAPH_URL.includes("your-subgraph-id")) {
      const data = await request(SUBGRAPH_URL, GET_USER_NFTS_QUERY, { userId })
      return (data as any).user
    } else {
      console.warn("The Graph subgraph URL not configured, returning null")
      return null
    }
  } catch (error) {
    console.error("Error fetching user NFTs from The Graph:", error)
    throw error
  }
}

export const fetchTransactions = async (first = 10, skip = 0, userId?: string) => {
  try {
    if (!SUBGRAPH_URL.includes("your-subgraph-id")) {
      const data = await request(SUBGRAPH_URL, GET_TRANSACTIONS_QUERY, {
        first,
        skip,
        userId,
      })
      return (data as any).transactions
    } else {
      console.warn("The Graph subgraph URL not configured, returning empty array")
      return []
    }
  } catch (error) {
    console.error("Error fetching transactions from The Graph:", error)
    throw error
  }
}

export const fetchTransfers = async (first = 10, skip = 0, nftId?: string) => {
  try {
    if (!SUBGRAPH_URL.includes("your-subgraph-id")) {
      const data = await request(SUBGRAPH_URL, GET_TRANSFERS_QUERY, {
        first,
        skip,
        nftId,
      })
      return (data as any).transfers
    } else {
      console.warn("The Graph subgraph URL not configured, returning empty array")
      return []
    }
  } catch (error) {
    console.error("Error fetching transfers from The Graph:", error)
    throw error
  }
}

export const fetchGlobalStats = async () => {
  try {
    if (!SUBGRAPH_URL.includes("your-subgraph-id")) {
      const data = await request(SUBGRAPH_URL, GET_GLOBAL_STATS_QUERY)
      return (data as any).globalStats
    } else {
      console.warn("The Graph subgraph URL not configured, returning null")
      return null
    }
  } catch (error) {
    console.error("Error fetching global stats from The Graph:", error)
    throw error
  }
}

// Real-time subscription (for WebSocket connections)
export const subscribeToNFTEvents = (callback: (data: any) => void) => {
  // This would typically use a WebSocket connection to The Graph
  // For now, we'll use polling as a fallback
  const pollInterval = 5000 // 5 seconds

  const poll = async () => {
    try {
      const latestNFTs = await fetchNFTs(5, 0, "createdAt", "desc")
      callback(latestNFTs)
    } catch (error) {
      console.error("Error polling NFT events:", error)
    }
  }

  const intervalId = setInterval(poll, pollInterval)

  // Return cleanup function
  return () => clearInterval(intervalId)
}
