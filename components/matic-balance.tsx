"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, RefreshCw } from "lucide-react"
import { checkMaticBalance } from "@/lib/blockchain-service"
import { toast } from "@/hooks/use-toast"
import TestnetGuide from "@/components/testnet-guide"

interface MaticBalanceProps {
  walletAddress: string
}

export default function MaticBalance({ walletAddress }: MaticBalanceProps) {
  const [balance, setBalance] = useState<string>("0")
  const [loading, setLoading] = useState(false)
  const [hasEnoughForGas, setHasEnoughForGas] = useState(false)

  const fetchBalance = async () => {
    if (!walletAddress) return

    setLoading(true)
    try {
      const balanceInfo = await checkMaticBalance(walletAddress)
      setBalance(balanceInfo.balance)
      setHasEnoughForGas(balanceInfo.hasEnoughForGas)
    } catch (error: any) {
      console.error("Error fetching MATIC balance:", error)
      toast({
        title: "Lỗi kiểm tra số dư",
        description: error.message,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBalance()
  }, [walletAddress])

  const openFaucet = () => {
    window.open("https://faucet.polygon.technology/", "_blank")
  }

  const openAlchemyFaucet = () => {
    window.open("https://www.alchemy.com/faucets/polygon-amoy", "_blank")
  }

  const openQuickNodeFaucet = () => {
    window.open("https://faucet.quicknode.com/polygon/amoy", "_blank")
  }

  return (
    <Card className="professional-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-purple-300">
          MATIC Balance
        </CardTitle>
        <Wallet className="h-4 w-4 text-purple-400" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-purple-100">
              {Number(balance).toFixed(4)} MATIC
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={hasEnoughForGas ? "default" : "destructive"}
                className={hasEnoughForGas 
                  ? "bg-green-500/20 text-green-400 border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border-red-500/30"
                }
              >
                {hasEnoughForGas ? "Đủ gas" : "Thiếu gas"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBalance}
              disabled={loading}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {!hasEnoughForGas && (
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFaucet}
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs"
                >
                  Polygon
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openAlchemyFaucet}
                  className="border-green-500/30 text-green-300 hover:bg-green-500/10 text-xs"
                >
                  Alchemy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openQuickNodeFaucet}
                  className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 text-xs"
                >
                  QuickNode
                </Button>
              </div>
            )}
          </div>
        </div>
        {!hasEnoughForGas && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-300 mb-2">
              <strong>Cần MATIC testnet để thực hiện giao dịch!</strong>
            </p>
            <p className="text-xs text-red-200 mb-2">
              • Bạn cần ít nhất 0.01 MATIC trên <strong>Polygon Amoy testnet</strong>
            </p>
            <p className="text-xs text-red-200 mb-2">
              • ETH trên mainnet không thể dùng cho testnet
            </p>
            <p className="text-xs text-blue-300">
              💡 Nhận MATIC testnet miễn phí từ các faucet bên phải ↗️
            </p>
            <div className="mt-2">
              <TestnetGuide walletAddress={walletAddress} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
