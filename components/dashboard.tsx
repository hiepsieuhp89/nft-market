"use client"

import { useState } from "react"
import type { User } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import CreateNFTForm from "@/components/create-nft-form"
import NFTGallery from "@/components/nft-gallery"
import TransferNFT from "@/components/transfer-nft"
import WalletConnect from "@/components/wallet-connect"
import TransactionHistory from "@/components/transaction-history"
import NFTStats from "@/components/nft-stats"
import { LogOut, Wallet, Plus, GalleryThumbnailsIcon as Gallery, Send, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [activeTab, setActiveTab] = useState("gallery")

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi đăng xuất",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              NFT Marketplace
            </h1>
            <p className="text-gray-600 mt-1">Chào mừng, {user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <WalletConnect onWalletConnect={setWalletAddress} />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* Wallet Status */}
        {walletAddress && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Ví đã kết nối:</span>
                <Badge variant="secondary" className="font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {walletAddress && <NFTStats userId={user.uid} />}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Gallery className="h-4 w-4" />
              Bộ sưu tập
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo NFT
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Chuyển NFT
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Lịch sử
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="mt-6">
            <NFTGallery userId={user.uid} walletAddress={walletAddress} />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <CreateNFTForm userId={user.uid} walletAddress={walletAddress} />
          </TabsContent>

          <TabsContent value="transfer" className="mt-6">
            <TransferNFT userId={user.uid} walletAddress={walletAddress} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <TransactionHistory userId={user.uid} walletAddress={walletAddress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
