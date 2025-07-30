"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { Wallet, ChevronDown, LogOut, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react"

interface WalletConnectProps {
  onWalletConnect: (address: string) => void
}

export default function WalletConnect({ onWalletConnect }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [hasMetaMask, setHasMetaMask] = useState<boolean | null>(null)

  const openMetaMaskInstall = () => {
    window.open("https://metamask.io/download/", "_blank")
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setHasMetaMask(false)
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
      setWalletAddress(address)
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

  const disconnectWallet = () => {
    setConnected(false)
    setWalletAddress("")
    onWalletConnect("")
    toast({
      title: "Đã ngắt kết nối ví",
      description: "Bạn có thể kết nối ví khác",
    })
  }

  const switchWallet = async () => {
    try {
      if (window.ethereum) {
        // Request to switch accounts
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        })
        // Reconnect after permission request
        await connectWallet()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi chuyển ví",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Check if MetaMask is installed and wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum === "undefined") {
        setHasMetaMask(false)
        return
      }

      setHasMetaMask(true)
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setConnected(true)
          setWalletAddress(accounts[0])
          onWalletConnect(accounts[0])
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
    checkConnection()
  }, [])

  // Show MetaMask installation prompt if not installed
  if (hasMetaMask === false) {
    return (
      <div className="flex flex-col gap-3">
        <Alert className="border-orange-500/30 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-300">
            <div className="flex flex-col gap-2">
              <span>MetaMask extension chưa được cài đặt</span>
              <Button
                onClick={openMetaMaskInstall}
                size="sm"
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold w-fit"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Cài đặt MetaMask
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show loading state while checking MetaMask
  if (hasMetaMask === null) {
    return (
      <Button disabled className="bg-gray-600 text-gray-300">
        <Wallet className="h-4 w-4 mr-2" />
        <span className="animate-pulse">Checking...</span>
      </Button>
    )
  }

  // Show connect button if MetaMask is installed but not connected
  if (!connected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={connecting}
        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 purple-glow-soft text-white font-semibold transition-all duration-200 hover-lift"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {connecting ? (
          <span className="animate-pulse">Connecting...</span>
        ) : (
          "Connect Wallet"
        )}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 purple-glow-soft text-white font-semibold transition-all duration-200 hover-lift">
          <Wallet className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <span className="sm:hidden">Connected</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <DropdownMenuItem onClick={switchWallet} className="cursor-pointer text-purple-300 hover:bg-purple-500/10">
          <RefreshCw className="h-4 w-4 mr-2" />
          Switch Wallet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-400 hover:bg-red-500/10">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
