"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTransactionHistory } from "@/lib/transaction-service"
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
}

export default function TransactionHistory({ userId, walletAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTransactions = async () => {
    try {
      const history = await getTransactionHistory(userId, walletAddress)
      setTransactions(history)
    } catch (error) {
      console.error("Error fetching transaction history:", error)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [userId, walletAddress])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions()
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "mint":
        return <Plus className="h-4 w-4 text-green-600" />
      case "transfer":
        return <Send className="h-4 w-4 text-blue-600" />
      default:
        return <Coins className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-100">
            Đã xác nhận
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-700 bg-yellow-100">
            Đang xử lý
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Thất bại</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Lịch sử giao dịch
            </CardTitle>
            <CardDescription>Theo dõi tất cả hoạt động mint và transfer NFT</CardDescription>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Làm mới"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch nào</h3>
            <p className="text-gray-600">Lịch sử giao dịch sẽ hiển thị ở đây sau khi bạn mint hoặc transfer NFT.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTransactionIcon(tx.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{tx.type === "mint" ? "Mint NFT" : "Transfer NFT"}</h4>
                        {getStatusBadge(tx.status)}
                      </div>

                      {tx.nftName && (
                        <p className="text-sm text-gray-600 mb-1">
                          NFT: <span className="font-medium">{tx.nftName}</span>
                        </p>
                      )}

                      {tx.tokenId && (
                        <p className="text-sm text-gray-600 mb-1">
                          Token ID: <span className="font-mono">#{tx.tokenId}</span>
                        </p>
                      )}

                      {tx.type === "transfer" && tx.to && (
                        <p className="text-sm text-gray-600 mb-1">
                          Đến:{" "}
                          <span className="font-mono">
                            {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                          </span>
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
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
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
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
