"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Download, Shield, Wallet, CheckCircle, AlertTriangle } from "lucide-react"

export default function MetaMaskInstallGuide() {
  const openMetaMaskInstall = () => {
    window.open("https://metamask.io/download/", "_blank")
  }

  const openMetaMaskDocs = () => {
    window.open("https://docs.metamask.io/", "_blank")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Alert */}
      <Alert className="border-orange-500/30 bg-orange-500/10">
        <AlertTriangle className="h-5 w-5 text-orange-400" />
        <AlertDescription className="text-orange-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">MetaMask Extension Required</h3>
              <p className="text-sm text-orange-300/80">
                Bạn cần cài đặt MetaMask để sử dụng NFT Marketplace
              </p>
            </div>
            <Button
              onClick={openMetaMaskInstall}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold w-fit"
            >
              <Download className="h-4 w-4 mr-2" />
              Cài đặt ngay
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Installation Guide */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Hướng dẫn cài đặt MetaMask
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What is MetaMask */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-300">MetaMask là gì?</h3>
            <p className="text-purple-300/80 text-sm">
              MetaMask là ví tiền điện tử phổ biến nhất, cho phép bạn tương tác với blockchain Ethereum và Polygon. 
              Nó hoạt động như một extension trên trình duyệt và giúp bạn quản lý tài sản số một cách an toàn.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Shield className="h-3 w-3 mr-1" />
                An toàn
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Dễ sử dụng
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Wallet className="h-3 w-3 mr-1" />
                Miễn phí
              </Badge>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Các bước cài đặt:</h3>
            <div className="grid gap-4">
              <div className="flex gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/20">
                <Badge className="bg-purple-500/20 text-purple-300 min-w-[24px] h-6 flex items-center justify-center">1</Badge>
                <div className="flex-1">
                  <p className="text-purple-200 font-medium">Truy cập trang chính thức</p>
                  <p className="text-purple-300/60 text-sm mt-1">
                    Click nút "Cài đặt ngay" ở trên hoặc truy cập metamask.io
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/20">
                <Badge className="bg-purple-500/20 text-purple-300 min-w-[24px] h-6 flex items-center justify-center">2</Badge>
                <div className="flex-1">
                  <p className="text-purple-200 font-medium">Chọn trình duyệt</p>
                  <p className="text-purple-300/60 text-sm mt-1">
                    Chọn Chrome, Firefox, Brave hoặc Edge tùy theo trình duyệt bạn đang sử dụng
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/20">
                <Badge className="bg-purple-500/20 text-purple-300 min-w-[24px] h-6 flex items-center justify-center">3</Badge>
                <div className="flex-1">
                  <p className="text-purple-200 font-medium">Cài đặt extension</p>
                  <p className="text-purple-300/60 text-sm mt-1">
                    Click "Add to Chrome" (hoặc trình duyệt tương ứng) và xác nhận cài đặt
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/20">
                <Badge className="bg-purple-500/20 text-purple-300 min-w-[24px] h-6 flex items-center justify-center">4</Badge>
                <div className="flex-1">
                  <p className="text-purple-200 font-medium">Tạo ví mới</p>
                  <p className="text-purple-300/60 text-sm mt-1">
                    Làm theo hướng dẫn để tạo ví mới hoặc import ví hiện có
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/20">
                <Badge className="bg-purple-500/20 text-purple-300 min-w-[24px] h-6 flex items-center justify-center">5</Badge>
                <div className="flex-1">
                  <p className="text-purple-200 font-medium">Refresh trang này</p>
                  <p className="text-purple-300/60 text-sm mt-1">
                    Sau khi cài đặt xong, refresh lại trang để kết nối ví
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-purple-500/20">
            <Button
              onClick={openMetaMaskInstall}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Cài đặt MetaMask
            </Button>
            <Button
              onClick={openMetaMaskDocs}
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Xem hướng dẫn chi tiết
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
