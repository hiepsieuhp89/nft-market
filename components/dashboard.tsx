"use client"

import CreateNFTForm from "@/components/create-nft-form"
import CreateNFTModal from "@/components/create-nft-modal"
import MarketplaceGallery from "@/components/marketplace-gallery"
import NFTCreationStatus from "@/components/nft-creation-status"
import NFTGallery from "@/components/nft-gallery"
import NFTStats from "@/components/nft-stats"
import TransactionHistory from "@/components/transaction-history"
import TransferNFT from "@/components/transfer-nft"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, GalleryThumbnailsIcon as Gallery, LogOut, Palette, Plus, Send, Wallet, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useLogout, useWalletInfo } from "@/hooks/use-api"
import type { User } from "@/lib/api-service"

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [activeTab, setActiveTab] = useState("marketplace")
  const [copiedAddress, setCopiedAddress] = useState(false)

  const logoutMutation = useLogout()
  const { data: walletInfo } = useWalletInfo()

  const handleSignOut = () => {
    logoutMutation.mutate()
  }

  const handleNFTCreated = () => {
    // Trigger refresh for all components
    setRefreshTrigger(Date.now())
  }

  const copyWalletAddress = async () => {
    if (walletInfo?.address) {
      try {
        await navigator.clipboard.writeText(walletInfo.address)
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } catch (error) {
        // Fallback for older browsers
        console.error('Copy failed:', error)
      }
    }
  }

  return (
    <div className="min-h-screen subtle-grid">
      <div className="max-w-7xl mx-auto p-6">
        {/* Professional Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg flex items-center justify-center purple-glow-soft">
                <Palette className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                NFT Marketplace
              </h1>
              <p className="text-purple-300 mt-1">
                Welcome back, <span className="text-purple-400 font-medium">{user.displayName || user.email}</span>
              </p>
              {walletInfo && (
                <p className="text-sm text-purple-400/70 mt-1">
                  Wallet: {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {walletInfo && (
              <CreateNFTModal userId={user.uid} walletAddress={walletInfo.address} />
            )}
            {walletInfo && (
              <Button
                onClick={copyWalletAddress}
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                {copiedAddress ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Wallet
                  </>
                )}
              </Button>
            )}
            {walletAddress && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <Wallet className="h-4 w-4 text-purple-400" />
                  <code className="text-purple-300 text-sm font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyWalletAddress}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all duration-200"
                  title="Copy wallet address"
                >
                  {copiedAddress ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-red-400/50 text-red-400 hover:bg-red-400/10 hover:border-red-400 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Wallet Status */}
        {walletInfo && (
          <Card className="mb-6 professional-card border-green-500/30 purple-glow-soft">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <Wallet className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Wallet: {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-300">Balance</p>
                  <p className="text-lg font-semibold text-purple-400">
                    {parseFloat(walletInfo.balanceInEth).toFixed(4)} MATIC
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NFT Status */}
        {walletInfo && (
          <div className="mb-6">
            <NFTCreationStatus
              userId={user.uid}
              walletAddress={walletInfo.address}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {/* Stats Overview */}
        {walletInfo && <NFTStats userId={user.uid} />}

        {/* Main Navigation */}
        {walletInfo && (
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto bg-black/20 border border-purple-500/30 p-1">
              <TabsTrigger
                value="marketplace"
                className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-purple-300 font-medium"
              >
                <Gallery className="h-4 w-4" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-purple-300 font-medium"
              >
                <Plus className="h-4 w-4" />
                Create NFT
              </TabsTrigger>
              <TabsTrigger
                value="assets"
                className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-purple-300 font-medium"
              >
                <Send className="h-4 w-4" />
                My Assets
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-purple-300 font-medium"
              >
                <Clock className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Marketplace Tab - Show all NFTs */}
            <TabsContent value="marketplace" className="mt-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-3">
                  Digital Marketplace
                </h2>
                <p className="text-purple-300/80 max-w-2xl mx-auto">
                  Explore and discover unique digital assets from creators around the world
                </p>
              </div>
              <MarketplaceGallery refreshTrigger={refreshTrigger} />
            </TabsContent>

            {/* Create NFT Tab */}
            <TabsContent value="create" className="mt-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-3">
                  Create Digital Asset
                </h2>
                <p className="text-purple-300/80 max-w-2xl mx-auto">
                  Mint your unique digital creation on the blockchain
                </p>
              </div>
              <CreateNFTForm
                userId={user.uid}
                walletAddress={walletInfo?.address || ""}
                onSuccess={handleNFTCreated}
              />
            </TabsContent>

            {/* My Assets Tab */}
            <TabsContent value="assets" className="mt-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-3">
                  My Digital Assets
                </h2>
                <p className="text-purple-300/80 max-w-2xl mx-auto">
                  Manage and transfer your owned NFTs
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Your Collection</h3>
                  <NFTGallery
                    userId={user.uid}
                    walletAddress={walletInfo?.address || ""}
                    refreshTrigger={refreshTrigger}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Transfer Assets</h3>
                  <TransferNFT userId={user.uid} walletAddress={walletInfo?.address || ""} />
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-3">
                  Transaction History
                </h2>
                <p className="text-purple-300/80 max-w-2xl mx-auto">
                  Track all your blockchain transactions and activities
                </p>
              </div>
              <TransactionHistory
                userId={user.uid}
                walletAddress={walletInfo?.address || ""}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
          </Tabs>
        </div>
        )}
      </div>
    </div>
  )
}
