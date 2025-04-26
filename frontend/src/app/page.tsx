"use client"

import type React from "react"

import { useState } from "react"
import { Copy, LinkIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"


export default function Home() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8080/api/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ long_url: url }),
      })

      if (!response.ok) {
        throw new Error("Failed to shorten URL")
      }

      const data = await response.json()
      setShortUrl(`http://localhost:3000/${data.short_url}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error shortening URL. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    toast.success("URL copied to clipboard")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">URL Shortener</CardTitle>
          <CardDescription className="text-center">Transform long URLs into short, manageable links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your URL here"
                  className="pr-10 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="URL to shorten"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Shortening...
                  </>
                ) : (
                  "Shorten URL"
                )}
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {shortUrl && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 transition-all duration-300 ease-in-out">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your shortened URL:</p>
              <div className="flex items-center">
                <div className="flex-1 overflow-hidden">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm break-all"
                  >
                    {shortUrl}
                  </a>
                </div>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="ml-2 flex-shrink-0"
                  aria-label="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
            Paste a long URL and get a shorter, more manageable link.
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
