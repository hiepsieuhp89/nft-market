"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Palette, Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const getErrorMessage = (error: any) => {
    switch (error.code) {
      case "auth/user-not-found":
        return "Không tìm thấy tài khoản với email này"
      case "auth/wrong-password":
        return "Mật khẩu không chính xác"
      case "auth/email-already-in-use":
        return "Email này đã được sử dụng"
      case "auth/weak-password":
        return "Mật khẩu quá yếu (tối thiểu 6 ký tự)"
      case "auth/invalid-email":
        return "Email không hợp lệ"
      case "auth/network-request-failed":
        return "Lỗi kết nối mạng"
      case "auth/too-many-requests":
        return "Quá nhiều yêu cầu. Vui lòng thử lại sau."
      default:
        return error.message || "Đã xảy ra lỗi không xác định"
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin",
        description: "Email và mật khẩu không được để trống.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn quay trở lại.",
      })
    } catch (error: any) {
      console.error("Sign in error:", error)
      toast({
        title: "Lỗi đăng nhập",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin",
        description: "Email và mật khẩu không được để trống.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Mật khẩu quá ngắn",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast({
        title: "Đăng ký thành công!",
        description: "Tài khoản của bạn đã được tạo.",
      })
    } catch (error: any) {
      console.error("Sign up error:", error)
      toast({
        title: "Lỗi đăng ký",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Palette className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            NFT Marketplace
          </h1>
          <p className="text-gray-600 mt-2">Tạo và giao dịch NFT trên Polygon</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chào mừng</CardTitle>
            <CardDescription>Đăng nhập hoặc tạo tài khoản để bắt đầu</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
                <TabsTrigger value="signup">Đăng ký</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    onKeyPress={(e) => e.key === "Enter" && handleSignIn()}
                  />
                </div>
                <Button onClick={handleSignIn} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Mật khẩu</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    onKeyPress={(e) => e.key === "Enter" && handleSignUp()}
                  />
                  <p className="text-xs text-gray-500">Tối thiểu 6 ký tự</p>
                </div>
                <Button onClick={handleSignUp} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
