"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useMintNFT } from "@/hooks/use-api"

interface CreateNFTFormProps {
  userId: string
  walletAddress: string
  onSuccess?: () => void
}

export default function CreateNFTForm({ userId, walletAddress, onSuccess }: CreateNFTFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
  })

  const mintNFTMutation = useMintNFT()

  const validateImageUrl = (url: string) => {
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
    return urlPattern.test(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.description || !formData.imageUrl) {
      return
    }

    if (!validateImageUrl(formData.imageUrl)) {
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      return
    }

    mintNFTMutation.mutate({
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
      price,
    }, {
      onSuccess: () => {
        setFormData({
          name: "",
          price: "",
          description: "",
          imageUrl: "",
        })
        onSuccess?.()
      }
    })
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
            disabled={mintNFTMutation.isPending}
          >
            {mintNFTMutation.isPending ? (
              <>
                <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                <span className="animate-pulse">
                  ĐANG TẠO NFT...
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

    </Card>
  )
}
