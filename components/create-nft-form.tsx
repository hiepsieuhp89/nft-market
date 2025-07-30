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
    try {
      // Check if connected to correct network
      await checkNetwork()

      // Check MATIC balance before creating NFT
      const balanceInfo = await checkMaticBalance(walletAddress)
      if (!balanceInfo.hasEnoughForGas) {
        toast({
          title: "Không đủ MATIC",
          description: `Số dư hiện tại: ${Number(balanceInfo.balance).toFixed(4)} MATIC. Bạn cần ít nhất 0.01 MATIC để trả phí gas. Vui lòng nạp thêm MATIC vào ví.`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const result = await createNFT({
        ...formData,
        userId,
        walletAddress,
        price: Number.parseFloat(formData.price),
      })

      setTransactionDetails(result)

      toast({
        title: "NFT đã được tạo thành công!",
        description: `Token ID: ${result.tokenId}`,
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
    } catch (error: any) {
      toast({
        title: "Lỗi tạo NFT",
        description: error.message,
        variant: "destructive",
      })
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
                <span className="animate-pulse">MINTING ASSET...</span>
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
        <div className="mt-8 p-6 bg-green-50 border border-green-300 rounded-lg">
          <h3 className="font-bold text-green-700 mb-4 text-xl text-center">
            🎉 ASSET SUCCESSFULLY MINTED!
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-green-300">
              <span className="text-green-700 font-bold text-sm uppercase tracking-wider">Token ID:</span>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">
                #{transactionDetails.tokenId}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-green-300">
              <span className="text-green-700 font-bold text-sm uppercase tracking-wider">Transaction:</span>
              <a
                href={`https://amoy.polygonscan.com/tx/${transactionDetails.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 hover:text-green-500 font-bold font-mono transition-colors"
              >
                <span className="text-xs">
                  {transactionDetails.transactionHash.slice(0, 8)}...{transactionDetails.transactionHash.slice(-6)}
                </span>
                <ExternalLink className="h-4 w-4" />
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
    </Card>
  )
}
