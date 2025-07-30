"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getNFTsByUser } from "@/lib/nft-service"
import { Loader2, ImageIcon, ExternalLink, Coins, ChevronLeft, ChevronRight } from "lucide-react"

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
  refreshTrigger?: number
}

export default function NFTGallery({ userId, walletAddress, refreshTrigger }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

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
  }, [userId, refreshTrigger])

  useEffect(() => {
    checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [nfts])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 purple-glow-soft" />
        </div>
        <span className="ml-3 text-purple-400 font-medium">Loading assets...</span>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card className="professional-card border-purple-500/30 text-center py-12">
        <CardContent>
          <ImageIcon className="h-16 w-16 mx-auto text-purple-400/50 mb-4" />
          <h3 className="text-xl font-semibold text-purple-400 mb-2">No Assets Found</h3>
          <p className="text-purple-300/70 max-w-md mx-auto">
            Create your first NFT to start building your digital collection
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="nft-gallery-container">
      {/* Scroll Navigation Buttons */}
      {nfts.length > 0 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/80 backdrop-blur-sm border-purple-500/30 hover:bg-purple-500/20 ${
              !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4 text-purple-400" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/80 backdrop-blur-sm border-purple-500/30 hover:bg-purple-500/20 ${
              !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4 text-purple-400" />
          </Button>
        </>
      )}

      <div
        ref={scrollContainerRef}
        className="nft-gallery-scroll"
        onScroll={checkScrollButtons}
      >
        {nfts.map((nft) => (
          <Card key={nft.id} className="nft-card professional-card border-purple-500/30 overflow-hidden hover:purple-glow-soft hover-lift group">
            <div className="aspect-square relative">
              <img
                src={nft.imageUrl || "/placeholder.svg"}
                alt={nft.name}
                className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              {nft.tokenId && (
                <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold">
                  #{nft.tokenId}
                </Badge>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-400 text-white font-medium">
                      {nft.price} MATIC
                    </Badge>
                    {nft.onChainPrice && (
                      <Badge className="bg-black/50 border border-purple-400/50 text-purple-400 text-xs flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {nft.onChainPrice}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-purple-400 truncate">
                {nft.name}
              </CardTitle>
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400/70">
                  {nft.createdAt?.toDate?.()?.toLocaleDateString() || "Recently created"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="line-clamp-2 text-purple-300/80">
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
          </Card>
        ))}
      </div>
    </div>
  )
}
