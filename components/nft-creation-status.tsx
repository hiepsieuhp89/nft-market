"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ExternalLink, Palette } from "lucide-react"
import { getNFTsByUser } from "@/lib/nft-service"

interface NFT {
  id: string
  name: string
  tokenId?: string
  transactionHash?: string
  createdAt: any
}

interface NFTCreationStatusProps {
  userId: string
  walletAddress: string
  refreshTrigger?: number
}

export default function NFTCreationStatus({ userId, walletAddress, refreshTrigger }: NFTCreationStatusProps) {
  const [recentNFTs, setRecentNFTs] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentNFTs = async () => {
      try {
        const nfts = await getNFTsByUser(userId)
        // Lấy 3 NFT mới nhất
        const recent = nfts
          .sort((a, b) => b.createdAt?.toDate?.()?.getTime() - a.createdAt?.toDate?.()?.getTime())
          .slice(0, 3)
        setRecentNFTs(recent)
      } catch (error) {
        console.error("Error fetching recent NFTs:", error)
      }
      setLoading(false)
    }

    if (userId) {
      fetchRecentNFTs()
    }
  }, [userId, refreshTrigger])

  if (loading) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" />
            Đang tải...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (recentNFTs.length === 0) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            NFT Creation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-purple-200 text-sm">Chưa có NFT nào được tạo</p>
            <p className="text-purple-300/60 text-xs mt-1">Tạo NFT đầu tiên của bạn!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          NFT Creation Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentNFTs.map((nft) => (
          <div key={nft.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/20">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-purple-100 text-sm font-medium truncate">
                  {nft.name}
                </span>
              </div>
              {nft.tokenId && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    Token #{nft.tokenId}
                  </Badge>
                  {nft.transactionHash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      onClick={() => window.open(`https://amoy.polygonscan.com/tx/${nft.transactionHash}`, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {recentNFTs.length > 0 && (
          <div className="pt-2 border-t border-purple-500/20">
            <p className="text-center text-xs text-purple-300/60">
              {recentNFTs.length} NFT gần đây • Xem tất cả trong tab "My Assets"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
