"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send } from "lucide-react"
import { useUserNFTs, useTransferNFT } from "@/hooks/use-api"
import type { NFT } from "@/lib/api-service"



interface TransferNFTProps {
  userId: string
  walletAddress: string
}

export default function TransferNFT({ userId, walletAddress }: TransferNFTProps) {
  const [selectedNFT, setSelectedNFT] = useState<string>("")
  const [recipientAddress, setRecipientAddress] = useState("")

  const { data: nfts = [], isLoading: loadingNFTs } = useUserNFTs()
  const transferNFTMutation = useTransferNFT()

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedNFT || !recipientAddress) {
      return
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      return
    }

    transferNFTMutation.mutate({ tokenId: selectedNFT, to: recipientAddress }, {
      onSuccess: () => {
        setSelectedNFT("")
        setRecipientAddress("")
      }
    })

  }

  const selectedNFTData = nfts.find((nft) => nft.id === selectedNFT)

  if (loadingNFTs) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-pink-400 cyber-glow" />
          <div className="absolute inset-0 h-12 w-12 border-2 border-pink-400/30 rounded-full animate-pulse"></div>
        </div>
        <span className="ml-4 text-pink-400 font-bold font-mono">LOADING ASSETS...</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="cyber-card border-pink-400/30 cyber-glow">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-pink-400 neon-text">
            <Send className="h-6 w-6" />
            ASSET TRANSFER PROTOCOL
          </CardTitle>
          <CardDescription className="text-pink-300/80 font-medium text-lg">
            Transfer your digital assets to another wallet address
          </CardDescription>
          <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mt-4"></div>
        </CardHeader>
        <CardContent className="p-8">
          {nfts.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative mb-6">
                <Send className="h-16 w-16 mx-auto text-pink-400/50 cyber-glow" />
                <div className="absolute inset-0 h-16 w-16 mx-auto border-2 border-pink-400/20 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-bold text-pink-400 neon-text mb-3">NO TRANSFERABLE ASSETS</h3>
              <p className="text-pink-300/70 font-medium">Create NFTs first to enable transfer functionality</p>
            </div>
          ) : (
            <form onSubmit={handleTransfer} className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="nft-select" className="text-pink-300 font-bold text-sm uppercase tracking-wider">
                  🎯 Select Asset
                </Label>
                <Select value={selectedNFT} onValueChange={setSelectedNFT}>
                  <SelectTrigger className="bg-black/30 border-pink-400/30 text-pink-100 focus:border-pink-400 focus:ring-pink-400/20 cyber-scan py-3">
                    <SelectValue placeholder="Choose NFT to transfer..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-pink-400/30">
                    {nfts.map((nft) => (
                      <SelectItem
                        key={nft.id}
                        value={nft.id}
                        className="text-pink-100 focus:bg-pink-400/20 focus:text-pink-400"
                      >
                        {nft.name} - {nft.price} MATIC
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedNFTData && (
                <Card className="cyber-card border-pink-400/20 bg-black/20">
                  <CardContent className="pt-6">
                    <div className="flex gap-6">
                      <img
                        src={selectedNFTData.imageUrl || "/placeholder.svg"}
                        alt={selectedNFTData.name}
                        className="w-24 h-24 object-cover rounded-lg cyber-glow border border-pink-400/30"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-pink-400 text-lg neon-text">{selectedNFTData.name}</h4>
                        <p className="text-sm text-pink-300/80 line-clamp-2 mt-2">{selectedNFTData.description}</p>
                        <p className="text-sm font-bold text-purple-400 mt-3 bg-purple-400/10 px-3 py-1 rounded-full inline-block">
                          {selectedNFTData.price} MATIC
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <Label htmlFor="recipient" className="text-pink-300 font-bold text-sm uppercase tracking-wider">
                  🎯 Recipient Address
                </Label>
                <Input
                  id="recipient"
                  placeholder="0x1234567890abcdef..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="bg-black/30 border-pink-400/30 text-pink-100 placeholder:text-pink-400/50 focus:border-pink-400 focus:ring-pink-400/20 cyber-scan font-mono text-sm py-3"
                />
                <p className="text-xs text-pink-400/70 font-mono">Enter the Ethereum/Polygon wallet address of the recipient</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold py-4 text-lg cyber-glow transition-all duration-300 transform hover:scale-105"
                disabled={transferNFTMutation.isPending}
              >
                {transferNFTMutation.isPending ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    <span className="animate-pulse">TRANSFERRING ASSET...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    EXECUTE TRANSFER
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      {transactionDetails && (
        <Card className="mt-8 cyber-card border-green-400/30 cyber-glow">
          <CardContent className="p-6">
            <h3 className="font-bold text-green-400 neon-text mb-4 text-xl text-center">
              ✅ TRANSFER COMPLETED SUCCESSFULLY!
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-green-400/20">
                <span className="text-green-300 font-bold text-sm uppercase tracking-wider">Transaction:</span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${transactionDetails.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 font-bold font-mono transition-colors cyber-glow"
                >
                  <span className="text-xs">
                    {transactionDetails.transactionHash.slice(0, 8)}...{transactionDetails.transactionHash.slice(-6)}
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-green-400/20">
                <span className="text-green-300 font-bold text-sm uppercase tracking-wider">Block:</span>
                <span className="font-mono text-green-400 text-sm">{transactionDetails.blockNumber}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-green-400/20">
                <span className="text-green-300 font-bold text-sm uppercase tracking-wider">Gas Used:</span>
                <span className="font-mono text-green-400 text-sm">{transactionDetails.gasUsed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
