"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { subscribeToNFTEvents, fetchGlobalStats } from "@/lib/thegraph-service"
import { Loader2, Activity, TrendingUp, Users, Coins } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface RealTimeEventsProps {
  walletAddress?: string
}

export default function RealTimeEvents({ walletAddress }: RealTimeEventsProps) {
  const [events, setEvents] = useState<any[]>([])
  const [globalStats, setGlobalStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let cleanup: (() => void) | null = null

    const initializeRealTime = async () => {
      try {
        // Fetch initial global stats
        const stats = await fetchGlobalStats()
        setGlobalStats(stats)

        // Subscribe to real-time events
        cleanup = subscribeToNFTEvents((newEvents) => {
          setEvents((prevEvents) => {
            // Merge new events with existing ones, avoiding duplicates
            const eventIds = new Set(prevEvents.map((e) => e.id))
            const uniqueNewEvents = newEvents.filter((e: any) => !eventIds.has(e.id))
            return [...uniqueNewEvents, ...prevEvents].slice(0, 50) // Keep only latest 50 events
          })
          setIsLive(true)
        })

        setLoading(false)
      } catch (error) {
        console.error("Error initializing real-time events:", error)
        setLoading(false)
      }
    }

    initializeRealTime()

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [])

  const getEventIcon = (event: any) => {
    if (event.transactions && event.transactions.length > 0) {
      const latestTx = event.transactions[0]
      switch (latestTx.type) {
        case "MINT":
          return <Coins className="h-4 w-4 text-green-600" />
        case "TRANSFER":
          return <Activity className="h-4 w-4 text-blue-600" />
        default:
          return <Activity className="h-4 w-4 text-gray-600" />
      }
    }
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  const getEventDescription = (event: any) => {
    if (event.transactions && event.transactions.length > 0) {
      const latestTx = event.transactions[0]
      switch (latestTx.type) {
        case "MINT":
          return `NFT #${event.tokenId} được mint bởi ${event.creator.address.slice(0, 6)}...${event.creator.address.slice(-4)}`
        case "TRANSFER":
          return `NFT #${event.tokenId} được chuyển đến ${event.owner.address.slice(0, 6)}...${event.owner.address.slice(-4)}`
        default:
          return `NFT #${event.tokenId} có hoạt động mới`
      }
    }
    return `NFT #${event.tokenId} có hoạt động mới`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Hoạt động Real-time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng NFTs</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalNFTs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giao dịch</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(Number(globalStats.totalVolume) / 1e18).toFixed(2)} MATIC</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hoạt động Real-time
                {isLive && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Live
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Theo dõi hoạt động NFT trên blockchain</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có hoạt động nào</h3>
              <p className="text-gray-600">Hoạt động real-time sẽ hiển thị ở đây.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  {getEventIcon(event)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{getEventDescription(event)}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Giá: {(Number(event.price) / 1e18).toFixed(3)} MATIC</span>
                      <span>
                        {formatDistanceToNow(new Date(Number(event.createdAt) * 1000), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                  {event.image && (
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
