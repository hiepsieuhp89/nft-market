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
import { checkNetwork } from "@/lib/blockchain-service"
import { Badge } from "@/components/ui/badge"

interface CreateNFTFormProps {
  userId: string
  walletAddress: string
}

export default function CreateNFTForm({ userId, walletAddress }: CreateNFTFormProps) {
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tạo NFT mới</CardTitle>
        <CardDescription>Tạo NFT độc đáo của riêng bạn trên mạng Polygon</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sản phẩm</Label>
            <Input
              id="name"
              placeholder="Nhập tên NFT"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Giá (MATIC)</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              placeholder="0.1"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả về NFT của bạn..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Thay đổi phần render form */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL hình ảnh</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
            <p className="text-xs text-gray-500">Nhập URL hình ảnh (JPG, PNG, GIF, WebP)</p>
            {formData.imageUrl && validateImageUrl(formData.imageUrl) && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo NFT...
              </>
            ) : (
              "Tạo NFT"
            )}
          </Button>
        </form>
      </CardContent>
      {transactionDetails && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">🎉 NFT đã được tạo thành công!</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Token ID:</span>
              <Badge variant="secondary">{transactionDetails.tokenId}</Badge>
            </div>
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
    </Card>
  )
}
