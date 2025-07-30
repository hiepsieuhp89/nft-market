"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import AuthForm from "@/components/auth-form"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    try {
      setLoading(true)
      setError(null)

      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          console.log("Auth state changed:", user ? "logged in" : "logged out")
          setUser(user)
          setLoading(false)
          setError(null)
          setAuthInitialized(true)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setError("Lỗi kết nối Firebase Auth")
          setLoading(false)
          setAuthInitialized(true)
        },
      )
    } catch (error: any) {
      console.error("Firebase initialization error:", error)
      setError(`Lỗi khởi tạo Firebase: ${error.message}`)
      setLoading(false)
      setAuthInitialized(true)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center subtle-grid">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400 purple-glow-soft" />
          <p className="text-purple-300">Đang khởi tạo ứng dụng...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center subtle-grid">
        <div className="text-center">
          <div className="professional-card border-red-500/30 p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Lỗi khởi tạo</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen professional-bg">
      {user ? <Dashboard user={user} /> : <AuthForm />}
    </main>
  )
}
