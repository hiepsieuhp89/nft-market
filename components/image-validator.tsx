"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface ImageValidatorProps {
  value: string
  onChange: (value: string) => void
  onValidationChange: (isValid: boolean) => void
}

export default function ImageValidator({ value, onChange, onValidationChange }: ImageValidatorProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  const validateImageUrl = async (url: string) => {
    if (!url) {
      setValidationResult(null)
      onValidationChange(false)
      return
    }

    // Basic URL pattern check
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
    if (!urlPattern.test(url)) {
      setValidationResult({
        isValid: false,
        message: "URL không hợp lệ. Vui lòng sử dụng định dạng: jpg, png, gif, webp",
      })
      onValidationChange(false)
      return
    }

    setIsValidating(true)

    try {
      // Test if image can be loaded
      const img = new Image()
      img.crossOrigin = "anonymous"

      const loadPromise = new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
      })

      const canLoad = await loadPromise

      if (canLoad) {
        setValidationResult({
          isValid: true,
          message: "Hình ảnh hợp lệ",
        })
        onValidationChange(true)
      } else {
        setValidationResult({
          isValid: false,
          message: "Không thể tải hình ảnh từ URL này",
        })
        onValidationChange(false)
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: "Lỗi khi kiểm tra hình ảnh",
      })
      onValidationChange(false)
    }

    setIsValidating(false)
  }

  const handleInputChange = (newValue: string) => {
    onChange(newValue)

    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateImageUrl(newValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="imageUrl">URL hình ảnh *</Label>
      <div className="relative">
        <Input
          id="imageUrl"
          placeholder="https://example.com/image.jpg"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          className={validationResult ? (validationResult.isValid ? "border-green-500" : "border-red-500") : ""}
        />
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        {validationResult && !isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validationResult.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {validationResult && (
        <p className={`text-xs ${validationResult.isValid ? "text-green-600" : "text-red-600"}`}>
          {validationResult.message}
        </p>
      )}

      <p className="text-xs text-gray-500">Nhập URL hình ảnh công khai (JPG, PNG, GIF, WebP)</p>

      {value && validationResult?.isValid && (
        <Card className="mt-2">
          <CardContent className="pt-4">
            <img
              src={value || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full h-48 object-cover rounded-lg mx-auto"
              onError={(e) => {
                setValidationResult({
                  isValid: false,
                  message: "Không thể hiển thị hình ảnh",
                })
                onValidationChange(false)
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
