"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CreateNFTForm from "@/components/create-nft-form"

interface CreateNFTModalProps {
  userId: string
  walletAddress: string
}

export default function CreateNFTModal({ userId, walletAddress }: CreateNFTModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl modal-content p-0 bg-card border-border">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b border-border bg-card/50 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Create Digital Asset
            </DialogTitle>
            <p className="text-muted-foreground mt-1">
              Mint your unique digital creation on the blockchain
            </p>
          </DialogHeader>

          <div className="modal-scroll px-6 py-4">
            <CreateNFTForm
              userId={userId}
              walletAddress={walletAddress}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
