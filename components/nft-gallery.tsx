"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getNFTsByUser } from "@/lib/nft-service"
import { Loader2, ImageIcon, ExternalLink, Coins } from "lucide-react"

interface NFT {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  createdAt: any
  userId: string
  walletAddress: string
  tokenId?: string
  transactionHash?: string
  onChainPrice?: string
  metadata?: any
}

interface NFTGalleryProps {
  userId: string
  walletAddress: string
}

export default function NFTGallery({ userId, walletAddress }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const userNFTs = await getNFTsByUser(userId)
        setNfts(userNFTs)
      } catch (error) {
        console.error("Error fetching NFTs:", error)
      }
      setLoading(false)
    }

    fetchNFTs()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có NFT nào</h3>
          <p className="text-gray-600">Bạn chưa tạo NFT nào. Hãy tạo NFT đầu tiên của bạn!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square relative">
            <img src={nft.imageUrl || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
            {nft.tokenId && <Badge className="absolute top-2 right-2 bg-purple-600">#{nft.tokenId}</Badge>}
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{nft.name}</CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {nft.price} MATIC
                </Badge>
                {nft.onChainPrice && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {nft.onChainPrice} MATIC
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {nft.createdAt?.toDate?.()?.toLocaleDateString() || "Vừa tạo"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="line-clamp-2">{nft.description}</CardDescription>
            {nft.transactionHash && (
              <div className="mt-2 pt-2 border-t">
                <a
                  href={`https://polygonscan.com/tx/${nft.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <span>Xem trên Polygonscan</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
