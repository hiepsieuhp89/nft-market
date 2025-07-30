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
    <div className="min-h-screen flex items-center justify-center p-4 subtle-grid">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Palette className="h-12 w-12 text-purple-500 purple-glow-soft" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">
            NFT Marketplace
          </h1>
          <p className="text-purple-300 mt-3 font-medium">Create and trade NFTs on Polygon Network</p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-4"></div>
        </div>

        <Card className="professional-card purple-glow shadow-xl border-purple-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-purple-400">
              Access System
            </CardTitle>
            <CardDescription className="text-purple-300/80">
              Connect to the NFT marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-purple-500/20">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-purple-300"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-purple-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-300 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="bg-black/20 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-300 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                    className="bg-black/20 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 purple-glow-soft transition-all duration-200 hover-lift"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-purple-300 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="bg-black/20 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-purple-300 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                    className="bg-black/20 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                  <p className="text-xs text-purple-400/70">Minimum 6 characters required</p>
                </div>
                <Button
                  onClick={handleSignUp}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 purple-glow-soft transition-all duration-200 hover-lift"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
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
