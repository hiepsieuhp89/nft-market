"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TestnetGuideProps {
  walletAddress?: string
}

export default function TestnetGuide({ walletAddress }: TestnetGuideProps) {
  const [open, setOpen] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopiedAddress(true)
      toast({
        title: "Đã copy địa chỉ ví",
        description: "Địa chỉ ví đã được copy vào clipboard",
      })
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const faucets = [
    {
      name: "Polygon Official Faucet",
      url: "https://faucet.polygon.technology/",
      description: "Faucet chính thức của Polygon",
      color: "purple",
      requirements: "Cần tài khoản Alchemy (miễn phí)"
    },
    {
      name: "Alchemy Faucet",
      url: "https://www.alchemy.com/faucets/polygon-amoy",
      description: "Faucet của Alchemy, dễ sử dụng",
      color: "blue",
      requirements: "Cần tài khoản Alchemy (miễn phí)"
    },
    {
      name: "QuickNode Faucet",
      url: "https://faucet.quicknode.com/polygon/amoy",
      description: "Faucet của QuickNode",
      color: "green",
      requirements: "Cần tài khoản QuickNode (miễn phí)"
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Hướng dẫn lấy MATIC
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl modal-content p-0 bg-card border-border">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b border-border bg-card/50 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Hướng dẫn lấy MATIC Testnet
            </DialogTitle>
            <p className="text-muted-foreground mt-1">
              Cách nhận MATIC miễn phí trên Polygon Amoy testnet
            </p>
          </DialogHeader>

          <div className="modal-scroll px-6 py-4 space-y-6">
            {/* Giải thích */}
            <Card className="professional-card border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Tại sao cần MATIC testnet?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <p>• <strong>Testnet vs Mainnet:</strong> Polygon Amoy là mạng thử nghiệm, hoàn toàn tách biệt với Ethereum mainnet</p>
                <p>• <strong>MATIC testnet miễn phí:</strong> Dùng để test ứng dụng mà không tốn tiền thật</p>
                <p>• <strong>Phí gas:</strong> Mọi giao dịch trên blockchain đều cần trả phí gas bằng MATIC</p>
              </CardContent>
            </Card>

            {/* Địa chỉ ví */}
            {walletAddress && (
              <Card className="professional-card border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400">Địa chỉ ví của bạn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 p-3 bg-black/20 rounded-lg border border-green-500/20">
                    <code className="text-green-300 text-sm flex-1 break-all">
                      {walletAddress}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAddress}
                      className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                    >
                      {copiedAddress ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Copy địa chỉ này để paste vào faucet
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Danh sách faucets */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">Các faucet khả dụng:</h3>
              {faucets.map((faucet, index) => (
                <Card key={index} className="professional-card">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-purple-300">{faucet.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={`border-${faucet.color}-500/30 text-${faucet.color}-300`}
                          >
                            Miễn phí
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{faucet.description}</p>
                        <p className="text-xs text-gray-400">{faucet.requirements}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(faucet.url, "_blank")}
                        className={`border-${faucet.color}-500/30 text-${faucet.color}-300 hover:bg-${faucet.color}-500/10`}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Mở faucet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Hướng dẫn từng bước */}
            <Card className="professional-card border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-blue-400">Hướng dẫn từng bước:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div className="flex gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 min-w-[24px] h-6 flex items-center justify-center">1</Badge>
                  <p>Đảm bảo MetaMask đã chuyển sang mạng <strong>Polygon Amoy</strong></p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 min-w-[24px] h-6 flex items-center justify-center">2</Badge>
                  <p>Copy địa chỉ ví của bạn (ở trên)</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 min-w-[24px] h-6 flex items-center justify-center">3</Badge>
                  <p>Chọn một faucet và mở link</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 min-w-[24px] h-6 flex items-center justify-center">4</Badge>
                  <p>Paste địa chỉ ví vào faucet và request MATIC</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 min-w-[24px] h-6 flex items-center justify-center">5</Badge>
                  <p>Đợi vài phút để MATIC được chuyển vào ví</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 min-w-[24px] h-6 flex items-center justify-center">6</Badge>
                  <p>Refresh trang để kiểm tra số dư mới</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
