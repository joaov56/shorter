/* eslint-disable @next/next/no-img-element */
"use client"

import type React from "react"

import { useState } from "react"
import { Copy, LinkIcon, Loader2, BarChart3, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import DashboardImage from '@/assets/dashboard.png'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!session) {
      router.push("/auth/signin")
      return
    }

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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Short Links, <span className="text-blue-300">Big Results</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                Transform long, unwieldy URLs into clean, memorable links that drive more clicks and boost your brand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50"
                  onClick={() => (session ? router.push("/dashboards") : router.push("/auth/signin"))}
                >
                  {session ? "Go to Dashboard" : "Sign Up Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-xl">
                <img
                  src={DashboardImage.src}
                  alt="URL Shortener Dashboard Preview"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* URL Shortener Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900" id="try-it">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shorten Your URL in Seconds</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Paste your long URL below and get a short, shareable link instantly.
            </p>
          </div>

          <Card className="w-full max-w-2xl mx-auto shadow-lg border-0">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">URL Shortener</CardTitle>
              <CardDescription className="text-center">
                Transform long URLs into short, manageable links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="url-input"
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
                {!session && (
                  <p className="mb-2">
                    <Link href="/auth/signin" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Sign in
                    </Link>{" "}
                    to access all features and track your links.
                  </p>
                )}
                Paste a long URL and get a shorter, more manageable link.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              More than just a URL shortener. Get the tools you need to optimize your links.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Track clicks, geographic data, referrers, and devices to understand your audience better.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Enterprise-grade security with 99.9% uptime guarantee and protection against malicious links.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <img
                src={DashboardImage.src}
                alt="Analytics Dashboard"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div className="flex-1 space-y-6 order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold">Powerful Analytics Dashboard</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Get detailed insights into your link performance with our comprehensive analytics dashboard.
              </p>
              <ul className="space-y-4">
                {[
                  "Track clicks and engagement in real-time",
                  "Analyze geographic distribution of your audience",
                  "Monitor referral sources and device types",
                  "Export data for custom reporting",
                  "Set up alerts for unusual traffic patterns",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 mt-0.5">
                      <svg
                        className="h-4 w-4 text-blue-600 dark:text-blue-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => (session ? router.push("/dashboards") : router.push("/auth/signin"))}
              >
                {session ? "View Your Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-signed URLs Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Pre-signed URLs for Temporary Access</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Create links that expire automatically after a set time or number of clicks.
              </p>
              <ul className="space-y-4">
                {[
                  "Perfect for sharing sensitive documents",
                  "Limit access to time-sensitive promotions",
                  "Control who can access your content and for how long",
                  "Set click limits to restrict access",
                  "Receive notifications when links are accessed",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 mt-0.5">
                      <svg
                        className="h-4 w-4 text-blue-600 dark:text-blue-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => (session ? router.push("/dashboards/pre-signed") : router.push("/auth/signin"))}
              >
                Create Pre-signed URL
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Create Pre-signed URL</CardTitle>
                  <CardDescription>Set expiration parameters for your link</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 opacity-75 pointer-events-none">
                    <div>
                      <label className="block text-sm font-medium mb-1">Original URL</label>
                      <Input placeholder="https://example.com/your-long-url" disabled />
                    </div>
                    <Button className="w-full bg-blue-600" disabled>
                      Generate Pre-signed URL
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="text-center text-sm text-gray-500">Sign up to access this feature</CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Supercharge Your Links?</h2>
            <p className="text-xl text-blue-100">
              Join thousands of marketers, content creators, and businesses who trust our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => router.push("/auth/signup")}
              >
                Sign Up Free
              </Button>
            </div>
            <p className="text-sm text-blue-200">No credit card required. Free plan available.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <LinkIcon className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-white font-bold text-lg">URLShortener</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} URLShortener. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
