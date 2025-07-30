"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Wallet } from "lucide-react"

interface WalletConnectProps {
  onWalletConnect: (address: string) => void
}

export default function WalletConnect({ onWalletConnect }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "MetaMask không được tìm thấy",
        description: "Vui lòng cài đặt MetaMask để tiếp tục.",
        variant: "destructive",
      })
      return
    }

    setConnecting(true)
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // Switch to Polygon Amoy testnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13882" }], // Polygon Amoy Testnet
        })
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13882",
                chainName: "Polygon Amoy",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc-amoy.polygon.technology/"],
                blockExplorerUrls: ["https://amoy.polygonscan.com/"],
              },
            ],
          })
        }
      }

      const address = accounts[0]
      onWalletConnect(address)
      setConnected(true)

      toast({
        title: "Ví đã kết nối thành công!",
        description: `Địa chỉ: ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
    } catch (error: any) {
      toast({
        title: "Lỗi kết nối ví",
        description: error.message,
        variant: "destructive",
      })
    }
    setConnecting(false)
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={connecting || connected}
      className={`${
        connected
          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 purple-glow-soft text-white font-semibold"
          : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 purple-glow-soft text-white font-semibold"
      } transition-all duration-200 hover-lift`}
    >
      <Wallet className="h-4 w-4 mr-2" />
      {connecting ? (
        <>
          <span className="animate-pulse">Connecting...</span>
        </>
      ) : connected ? (
        "Connected"
      ) : (
        "Connect Wallet"
      )}
    </Button>
  )
}
