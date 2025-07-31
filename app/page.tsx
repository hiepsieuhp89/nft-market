"use client"

import { Loader2 } from "lucide-react"
import AuthForm from "@/components/auth-form"
import Dashboard from "@/components/dashboard"
import { useProfile } from "@/hooks/use-api"

export default function Home() {
  const { data: user, isLoading, error } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center subtle-grid">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400 purple-glow-soft" />
          <p className="text-purple-300">Đang khởi tạo ứng dụng...</p>
        </div>
      </div>
    )
  }

  // If there's an error, it means user is not authenticated, show auth form
  // Error handling is done in the hooks with toast notifications

  return (
    <main className="min-h-screen professional-bg">
      {user ? <Dashboard user={user} /> : <AuthForm />}
    </main>
  )
}
