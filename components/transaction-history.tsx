"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTransactionHistory } from "@/lib/transaction-service"
import { getNFTTransferEvents } from "@/lib/moralis-service"
import { CONTRACT_CONFIG } from "@/lib/contract-config"
import { Loader2, ExternalLink, Coins, Send, Plus, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface Transaction {
  id: string
  type: "mint" | "transfer"
  tokenId?: string
  nftName?: string
  transactionHash: string
  blockNumber: number
  gasUsed: string
  from?: string
  to?: string
  timestamp: any
  status: "pending" | "confirmed" | "failed"
}

interface TransactionHistoryProps {
  userId: string
  walletAddress: string
  refreshTrigger?: number // Để trigger refresh từ bên ngoài
}

export default function TransactionHistory({ userId, walletAddress, refreshTrigger }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTransactions = async () => {
    try {
      console.log("Fetching transactions for:", { userId, walletAddress })

      // Get transactions from both sources
      const [firestoreTransactions, moralisEvents] = await Promise.all([
        getTransactionHistory(userId, walletAddress),
        getNFTTransferEvents(CONTRACT_CONFIG.address, walletAddress).catch(() => [])
      ])

      console.log("Firestore transactions:", firestoreTransactions)
      console.log("Moralis events:", moralisEvents)

      // Map Firestore transactions
      const mappedFirestoreTransactions = firestoreTransactions.map(tx => ({
        ...tx,
        id: tx.id || ""
      }))

      // Merge and deduplicate transactions
      const allTransactions = [...mappedFirestoreTransactions]

      // Add Moralis events that aren't already in Firestore
      moralisEvents.forEach((event: any) => {
        const exists = mappedFirestoreTransactions.some(tx => tx.transactionHash === event.transactionHash)
        if (!exists) {
          allTransactions.push({
            id: event.transactionHash,
            userId: userId,
            walletAddress: walletAddress,
            type: event.type,
            tokenId: event.tokenId,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            gasUsed: "0", // Moralis doesn't provide gas info in transfers
            from: event.from,
            to: event.to,
            timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
            status: event.status,
            nftName: `NFT #${event.tokenId}`
          })
        }
      })

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : b.timestamp
        return new Date(timeB).getTime() - new Date(timeA).getTime()
      })

      setTransactions(allTransactions)
    } catch (error) {
      console.error("Error fetching transaction history:", error)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [userId, walletAddress, refreshTrigger])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions()
  }



  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "mint":
        return <Plus className="h-4 w-4 text-green-400" />
      case "transfer":
        return <Send className="h-4 w-4 text-blue-400" />
      default:
        return <Coins className="h-4 w-4 text-purple-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Đã xác nhận
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Đang xử lý
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Thất bại
          </Badge>
        )
      default:
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Không xác định
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="professional-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Clock className="h-5 w-5 text-purple-400" />
              Lịch sử giao dịch
            </CardTitle>
            <CardDescription className="text-purple-300/80">Theo dõi tất cả hoạt động mint và transfer NFT</CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Làm mới"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-purple-300">Chưa có giao dịch nào</h3>
            <p className="text-purple-300/60">Lịch sử giao dịch sẽ hiển thị ở đây sau khi bạn mint hoặc transfer NFT.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="border border-purple-500/20 rounded-lg p-4 hover:bg-purple-500/5 transition-colors bg-black/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTransactionIcon(tx.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-purple-300">{tx.type === "mint" ? "Mint NFT" : "Transfer NFT"}</h4>
                        {getStatusBadge(tx.status)}
                      </div>

                      {tx.nftName && (
                        <p className="text-sm text-purple-300/80 mb-1">
                          NFT: <span className="font-medium text-purple-200">{tx.nftName}</span>
                        </p>
                      )}

                      {tx.tokenId && (
                        <p className="text-sm text-purple-300/80 mb-1">
                          Token ID: <span className="font-mono text-purple-200">#{tx.tokenId}</span>
                        </p>
                      )}

                      {tx.type === "transfer" && tx.to && (
                        <p className="text-sm text-purple-300/80 mb-1">
                          Đến:{" "}
                          <span className="font-mono text-purple-200">
                            {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                          </span>
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-purple-400/60 mt-2">
                        <span>Block: {tx.blockNumber}</span>
                        <span>Gas: {tx.gasUsed}</span>
                        <span>
                          {tx.timestamp?.toDate
                            ? formatDistanceToNow(tx.timestamp.toDate(), { addSuffix: true, locale: vi })
                            : "Vừa xong"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://amoy.polygonscan.com/tx/${tx.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  >
                    <span>Xem</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
