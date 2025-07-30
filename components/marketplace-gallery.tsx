"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllNFTs } from "@/lib/nft-service"
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

interface MarketplaceGalleryProps {
  refreshTrigger?: number
}

export default function MarketplaceGallery({ refreshTrigger }: MarketplaceGalleryProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true)
      try {
        const allNFTs = await getAllNFTs()
        setNfts(allNFTs)
      } catch (error) {
        console.error("Error fetching marketplace NFTs:", error)
      }
      setLoading(false)
    }

    fetchNFTs()
  }, [refreshTrigger])



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card className="professional-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-16 w-16 text-purple-400 mb-4" />
          <h3 className="text-xl font-semibold text-purple-300 mb-2">No NFTs Available</h3>
          <p className="text-purple-200/60 text-center max-w-md">
            The marketplace is empty. Be the first to mint and showcase your digital creation!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {nfts.map((nft) => (
        <Card key={nft.id} className="professional-card group hover:scale-105 transition-all duration-300 flex flex-col">
          {/* Image Section - Fixed aspect ratio */}
          <div className="relative overflow-hidden rounded-t-lg">
            <div className="aspect-square relative bg-gradient-to-br from-purple-900/20 to-blue-900/20">
              <img
                src={nft.imageUrl || "/placeholder.svg"}
                alt={nft.name}
                className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              {nft.tokenId && (
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-xs">
                  #{nft.tokenId}
                </Badge>
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-yellow-400" />
                  <span className="text-white font-bold text-sm">
                    {nft.price} MATIC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section - Flexible height */}
          <div className="flex flex-col flex-1">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-purple-300 text-base line-clamp-1 leading-tight" title={nft.name}>
                {nft.name}
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-purple-400">
                <span className="text-xs">Creator:</span>
                <code className="text-xs bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300">
                  {nft.walletAddress?.slice(0, 4)}...{nft.walletAddress?.slice(-3)}
                </code>
              </div>
            </CardHeader>

            <CardContent className="pt-0 px-3 pb-3 flex-1 flex flex-col">
              <CardDescription className="line-clamp-2 text-purple-300/80 text-sm flex-1" title={nft.description}>
                {nft.description}
              </CardDescription>

              {nft.transactionHash && (
                <div className="mt-2 pt-2 border-t border-purple-400/20">
                  <a
                    href={`https://amoy.polygonscan.com/tx/${nft.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span>View on blockchain</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
}
