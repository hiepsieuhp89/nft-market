"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { createNFT } from "@/lib/nft-service"
import { Loader2, ExternalLink } from "lucide-react"
import { checkNetwork, checkMaticBalance } from "@/lib/blockchain-service"
import { Badge } from "@/components/ui/badge"

interface CreateNFTFormProps {
  userId: string
  walletAddress: string
  onSuccess?: () => void
}

export default function CreateNFTForm({ userId, walletAddress, onSuccess }: CreateNFTFormProps) {
  // Thay đổi từ upload file sang nhập image URL
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "", // Thay đổi từ image file sang imageUrl
  })
  const [loading, setLoading] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [creationStep, setCreationStep] = useState<string>("")

  // Xóa imagePreview và handleImageChange
  // Thêm validation cho image URL
  const validateImageUrl = (url: string) => {
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
    return urlPattern.test(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletAddress) {
      toast({
        title: "Vui lòng kết nối ví",
        description: "Bạn cần kết nối ví MetaMask để tạo NFT.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.price || !formData.description || !formData.imageUrl) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin",
        description: "Tất cả các trường đều bắt buộc.",
        variant: "destructive",
      })
      return
    }

    if (!validateImageUrl(formData.imageUrl)) {
      toast({
        title: "URL hình ảnh không hợp lệ",
        description: "Vui lòng nhập URL hình ảnh hợp lệ (jpg, png, gif, webp).",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setCreationStep("Đang kiểm tra mạng...")
    try {
      // Check if connected to correct network
      await checkNetwork()

      setCreationStep("Đang kiểm tra số dư MATIC...")
      // Check MATIC balance before creating NFT
      const balanceInfo = await checkMaticBalance(walletAddress)
      if (!balanceInfo.hasEnoughForGas) {
        toast({
          title: "Không đủ MATIC",
          description: `Số dư hiện tại: ${Number(balanceInfo.balance).toFixed(4)} MATIC. Bạn cần ít nhất 0.01 MATIC để trả phí gas. Vui lòng nạp thêm MATIC vào ví.`,
          variant: "destructive",
        })
        setLoading(false)
        setCreationStep("")
        return
      }

      setCreationStep("Đang tạo NFT trên blockchain...")
      const result = await createNFT({
        ...formData,
        userId,
        walletAddress,
        price: Number.parseFloat(formData.price),
      })

      setCreationStep("Hoàn thành!")
      setTransactionDetails(result)

      toast({
        title: "🎉 NFT đã được tạo thành công!",
        description: `Token ID: #${result.tokenId} | Transaction: ${result.transactionHash.slice(0, 10)}...${result.transactionHash.slice(-8)}`,
      })

      // Call onSuccess callback if provided
      onSuccess?.()

      // Reset form
      setFormData({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
      })

      // Clear creation step after a delay
      setTimeout(() => setCreationStep(""), 2000)
    } catch (error: any) {
      toast({
        title: "Lỗi tạo NFT",
        description: error.message,
        variant: "destructive",
      })
      setCreationStep("")
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-3xl mx-auto form-container">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-purple-600 mb-2">
          ⚡ DIGITAL ASSET CREATION
        </CardTitle>
        <CardDescription className="text-gray-600 font-medium text-lg">
          Mint your unique digital creation on the Polygon blockchain
        </CardDescription>
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-4"></div>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="name" className="text-gray-700 font-bold text-sm uppercase tracking-wider">
              🎯 Asset Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your NFT name..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-field text-lg py-3"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="price" className="text-gray-700 font-bold text-sm uppercase tracking-wider">
              💰 Price (MATIC)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              placeholder="0.1"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="form-field text-lg py-3"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="description" className="text-gray-700 font-bold text-sm uppercase tracking-wider">
              📝 Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your digital masterpiece..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-field resize-none"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="imageUrl" className="text-gray-700 font-bold text-sm uppercase tracking-wider">
              🖼️ Image URL
            </Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/your-artwork.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="form-field text-lg py-3"
            />
            <p className="text-xs text-gray-500 font-mono">Supported formats: JPG, PNG, GIF, WebP</p>
            {formData.imageUrl && validateImageUrl(formData.imageUrl) && (
              <div className="mt-4 p-4 bg-white/90 border border-purple-300 rounded-lg">
                <p className="text-gray-700 font-bold mb-3 text-sm uppercase tracking-wider">Preview:</p>
                <img
                  src={formData.imageUrl || "/placeholder.svg"}
                  alt="NFT Preview"
                  className="max-w-full h-64 object-cover rounded-lg border border-purple-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                <span className="animate-pulse">
                  {creationStep || "ĐANG TẠO NFT..."}
                </span>
              </>
            ) : (
              <>
                <span className="mr-2">⚡</span>
                MINT NFT ON BLOCKCHAIN
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {transactionDetails && (
        <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg professional-card">
          <h3 className="font-bold text-green-400 mb-4 text-xl text-center flex items-center justify-center gap-2">
            🎉 NFT ĐÃ ĐƯỢC TẠO THÀNH CÔNG!
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-green-500/20">
              <span className="text-green-300 font-bold text-sm uppercase tracking-wider">Token ID:</span>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">
                #{transactionDetails.tokenId}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-green-500/20">
              <span className="text-green-300 font-bold text-sm uppercase tracking-wider">Transaction Hash:</span>
              <a
                href={`https://amoy.polygonscan.com/tx/${transactionDetails.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 font-bold font-mono transition-colors"
              >
                <span className="text-xs">
                  {transactionDetails.transactionHash.slice(0, 10)}...{transactionDetails.transactionHash.slice(-8)}
                </span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/20">
              <span className="text-purple-300 font-medium">Block Number:</span>
              <span className="font-mono text-sm text-purple-200">{transactionDetails.blockNumber}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/20">
              <span className="text-purple-300 font-medium">Gas Used:</span>
              <span className="font-mono text-sm text-purple-200">{transactionDetails.gasUsed}</span>
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm text-center">
                ✅ NFT của bạn đã được mint thành công trên Polygon Amoy testnet!
                <br />
                <span className="text-blue-200 text-xs">
                  Bạn có thể xem NFT trong tab "My Assets" hoặc kiểm tra transaction trên PolygonScan
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
