"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { getNFTsByUser, transferNFT } from "@/lib/nft-service"
import { Loader2, Send, ExternalLink } from "lucide-react"
import { checkNetwork } from "@/lib/blockchain-service"

interface NFT {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  createdAt: any
  userId: string
  walletAddress: string
}

interface TransferNFTProps {
  userId: string
  walletAddress: string
}

export default function TransferNFT({ userId, walletAddress }: TransferNFTProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [selectedNFT, setSelectedNFT] = useState<string>("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingNFTs, setFetchingNFTs] = useState(true)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const userNFTs = await getNFTsByUser(userId)
        setNfts(userNFTs)
      } catch (error) {
        console.error("Error fetching NFTs:", error)
      }
      setFetchingNFTs(false)
    }

    fetchNFTs()
  }, [userId])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletAddress) {
      toast({
        title: "Vui lòng kết nối ví",
        description: "Bạn cần kết nối ví MetaMask để chuyển NFT.",
        variant: "destructive",
      })
      return
    }

    if (!selectedNFT || !recipientAddress) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin",
        description: "Chọn NFT và nhập địa chỉ người nhận.",
        variant: "destructive",
      })
      return
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      toast({
        title: "Địa chỉ không hợp lệ",
        description: "Vui lòng nhập địa chỉ Ethereum hợp lệ.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Check if connected to correct network
      await checkNetwork()

      const result = await transferNFT(selectedNFT, recipientAddress, walletAddress)

      setTransactionDetails(result)

      toast({
        title: "Chuyển NFT thành công!",
        description: "NFT đã được chuyển đến địa chỉ người nhận.",
      })

      // Reset form
      setSelectedNFT("")
      setRecipientAddress("")

      // Refresh NFT list
      const userNFTs = await getNFTsByUser(userId, walletAddress)
      setNfts(userNFTs)
    } catch (error: any) {
      toast({
        title: "Lỗi chuyển NFT",
        description: error.message,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const selectedNFTData = nfts.find((nft) => nft.id === selectedNFT)

  if (fetchingNFTs) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Chuyển NFT
          </CardTitle>
          <CardDescription>Chuyển NFT của bạn đến địa chỉ ví khác</CardDescription>
        </CardHeader>
        <CardContent>
          {nfts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Bạn chưa có NFT nào để chuyển. Hãy tạo NFT trước!</p>
            </div>
          ) : (
            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nft-select">Chọn NFT</Label>
                <Select value={selectedNFT} onValueChange={setSelectedNFT}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn NFT để chuyển" />
                  </SelectTrigger>
                  <SelectContent>
                    {nfts.map((nft) => (
                      <SelectItem key={nft.id} value={nft.id}>
                        {nft.name} - {nft.price} MATIC
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedNFTData && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex gap-4">
                      <img
                        src={selectedNFTData.imageUrl || "/placeholder.svg"}
                        alt={selectedNFTData.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{selectedNFTData.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{selectedNFTData.description}</p>
                        <p className="text-sm font-medium text-purple-600 mt-1">{selectedNFTData.price} MATIC</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="recipient">Địa chỉ người nhận</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">Nhập địa chỉ ví Ethereum/Polygon của người nhận</p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang chuyển...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Chuyển NFT
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      {transactionDetails && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ Chuyển NFT thành công!</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Transaction Hash:</span>
              <a
                href={`https://polygonscan.com/tx/${transactionDetails.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <span className="font-mono text-xs">
                  {transactionDetails.transactionHash.slice(0, 6)}...{transactionDetails.transactionHash.slice(-4)}
                </span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Block Number:</span>
              <span className="font-mono text-xs">{transactionDetails.blockNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Gas Used:</span>
              <span className="font-mono text-xs">{transactionDetails.gasUsed}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
