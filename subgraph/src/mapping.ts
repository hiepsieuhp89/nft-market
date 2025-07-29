import { BigInt, type Address } from "@graphprotocol/graph-ts"
import type { NFTMinted, NFTTransferred, Transfer, PriceUpdated } from "../generated/NFTMarketplace/NFTMarketplace"
import { NFT, User, Transaction, Transfer as TransferEntity, GlobalStats } from "../generated/schema"

// Helper function to get or create user
function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString())

  if (user == null) {
    user = new User(address.toHexString())
    user.address = address
    user.totalNFTsCreated = BigInt.fromI32(0)
    user.totalNFTsOwned = BigInt.fromI32(0)
    user.totalTransactions = BigInt.fromI32(0)
    user.firstTransactionAt = BigInt.fromI32(0)
    user.lastTransactionAt = BigInt.fromI32(0)
    user.save()

    // Update global stats
    updateGlobalStats()
  }

  return user
}

// Helper function to update global stats
function updateGlobalStats(): void {
  let stats = GlobalStats.load("global")

  if (stats == null) {
    stats = new GlobalStats("global")
    stats.totalNFTs = BigInt.fromI32(0)
    stats.totalUsers = BigInt.fromI32(0)
    stats.totalTransactions = BigInt.fromI32(0)
    stats.totalVolume = BigInt.fromI32(0)
  }

  stats.totalUsers = stats.totalUsers.plus(BigInt.fromI32(1))
  stats.lastUpdated = BigInt.fromI32(Date.now())
  stats.save()
}

export function handleNFTMinted(event: NFTMinted): void {
  const tokenId = event.params.tokenId
  const creator = event.params.creator
  const tokenURI = event.params.tokenURI
  const price = event.params.price

  // Create or get user
  const user = getOrCreateUser(creator)
  user.totalNFTsCreated = user.totalNFTsCreated.plus(BigInt.fromI32(1))
  user.totalNFTsOwned = user.totalNFTsOwned.plus(BigInt.fromI32(1))
  user.totalTransactions = user.totalTransactions.plus(BigInt.fromI32(1))

  if (user.firstTransactionAt.equals(BigInt.fromI32(0))) {
    user.firstTransactionAt = event.block.timestamp
  }
  user.lastTransactionAt = event.block.timestamp
  user.save()

  // Create NFT entity
  const nft = new NFT(tokenId.toString())
  nft.tokenId = tokenId
  nft.creator = user.id
  nft.owner = user.id
  nft.tokenURI = tokenURI
  nft.price = price
  nft.createdAt = event.block.timestamp
  nft.updatedAt = event.block.timestamp

  // Parse metadata from tokenURI (simplified)
  nft.name = "NFT #" + tokenId.toString()
  nft.description = "NFT created on marketplace"
  nft.image = ""

  nft.save()

  // Create transaction record
  const transaction = new Transaction(event.transaction.hash.toHexString())
  transaction.type = "MINT"
  transaction.nft = nft.id
  transaction.user = user.id
  transaction.price = price
  transaction.gasUsed = event.transaction.gasUsed
  transaction.gasPrice = event.transaction.gasPrice
  transaction.blockNumber = event.block.number
  transaction.blockTimestamp = event.block.timestamp
  transaction.transactionHash = event.transaction.hash
  transaction.save()

  // Update global stats
  let stats = GlobalStats.load("global")
  if (stats == null) {
    stats = new GlobalStats("global")
    stats.totalNFTs = BigInt.fromI32(0)
    stats.totalUsers = BigInt.fromI32(0)
    stats.totalTransactions = BigInt.fromI32(0)
    stats.totalVolume = BigInt.fromI32(0)
  }

  stats.totalNFTs = stats.totalNFTs.plus(BigInt.fromI32(1))
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1))
  stats.totalVolume = stats.totalVolume.plus(price)
  stats.lastUpdated = event.block.timestamp
  stats.save()
}

export function handleNFTTransferred(event: NFTTransferred): void {
  const tokenId = event.params.tokenId
  const from = event.params.from
  const to = event.params.to

  // Update NFT ownership
  const nft = NFT.load(tokenId.toString())
  if (nft != null) {
    const fromUser = getOrCreateUser(from)
    const toUser = getOrCreateUser(to)

    // Update user stats
    fromUser.totalNFTsOwned = fromUser.totalNFTsOwned.minus(BigInt.fromI32(1))
    fromUser.totalTransactions = fromUser.totalTransactions.plus(BigInt.fromI32(1))
    fromUser.lastTransactionAt = event.block.timestamp
    fromUser.save()

    toUser.totalNFTsOwned = toUser.totalNFTsOwned.plus(BigInt.fromI32(1))
    toUser.totalTransactions = toUser.totalTransactions.plus(BigInt.fromI32(1))
    if (toUser.firstTransactionAt.equals(BigInt.fromI32(0))) {
      toUser.firstTransactionAt = event.block.timestamp
    }
    toUser.lastTransactionAt = event.block.timestamp
    toUser.save()

    // Update NFT owner
    nft.owner = toUser.id
    nft.updatedAt = event.block.timestamp
    nft.save()

    // Create transfer record
    const transfer = new TransferEntity(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
    transfer.nft = nft.id
    transfer.from = fromUser.id
    transfer.to = toUser.id
    transfer.blockNumber = event.block.number
    transfer.blockTimestamp = event.block.timestamp
    transfer.transactionHash = event.transaction.hash
    transfer.gasUsed = event.transaction.gasUsed
    transfer.save()

    // Create transaction record
    const transaction = new Transaction(event.transaction.hash.toHexString())
    transaction.type = "TRANSFER"
    transaction.nft = nft.id
    transaction.user = fromUser.id
    transaction.from = fromUser.id
    transaction.to = toUser.id
    transaction.gasUsed = event.transaction.gasUsed
    transaction.gasPrice = event.transaction.gasPrice
    transaction.blockNumber = event.block.number
    transaction.blockTimestamp = event.block.timestamp
    transaction.transactionHash = event.transaction.hash
    transaction.save()

    // Update global stats
    const stats = GlobalStats.load("global")
    if (stats != null) {
      stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1))
      stats.lastUpdated = event.block.timestamp
      stats.save()
    }
  }
}

export function handleTransfer(event: Transfer): void {
  // Handle standard ERC721 Transfer events
  // This is called for both mint and transfer operations
}

export function handlePriceUpdated(event: PriceUpdated): void {
  const tokenId = event.params.tokenId
  const newPrice = event.params.newPrice

  const nft = NFT.load(tokenId.toString())
  if (nft != null) {
    nft.price = newPrice
    nft.updatedAt = event.block.timestamp
    nft.save()

    // Create transaction record
    const transaction = new Transaction(event.transaction.hash.toHexString())
    transaction.type = "PRICE_UPDATE"
    transaction.nft = nft.id
    transaction.user = nft.owner
    transaction.price = newPrice
    transaction.gasUsed = event.transaction.gasUsed
    transaction.gasPrice = event.transaction.gasPrice
    transaction.blockNumber = event.block.number
    transaction.blockTimestamp = event.block.timestamp
    transaction.transactionHash = event.transaction.hash
    transaction.save()
  }
}
