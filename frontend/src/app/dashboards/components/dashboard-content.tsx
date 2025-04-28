"use client"

import { useState } from "react"
import { BarChart, Copy, ExternalLink, LinkIcon, MousePointerClick, Plus, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

type Click = {
  id: string
  shortUrl: string
  clickedAt: string
  ip: string
  userAgent: string
}

type Link = {
  id: string
  originalUrl: string
  shortUrl: string
  clicks: number
  createdAt: string
  lastClickedAt: string
  clickStats?: Click[]
}

type DashboardContentProps = {
  links: Link[]
  totalClicks: number
  totalLinks: number
  mostClickedLink: Link
}

export default function DashboardContent({ links, totalClicks, totalLinks, mostClickedLink }: DashboardContentProps) {
    const { data: session } = useSession()
  const [newUrl, setNewUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLink] = useState<Link | null>(null)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)

  const handleCreateShortLink = async () => {
    if (!newUrl) return

    setIsCreatingLink(true)

    try {
        const response = await fetch("http://localhost:8080/api/url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ long_url: newUrl, email: session?.user?.email }),
        })
  
        if (!response.ok) {
          throw new Error("Failed to shorten URL")
        }
  
        const data = await response.json()
        setShortUrl(`http://localhost:3000/${data.short_url}`)
      } catch {
        toast.error("Error shortening URL. Please try again.")
      } finally {
        setIsCreatingLink(false)
      }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const truncateUrl = (url: string, maxLength = 40) => {
    return url?.length > maxLength ? `${url.substring(0, maxLength)}...` : url
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Shorten URL
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Shortened URL</DialogTitle>
                <DialogDescription>Enter the URL you want to shorten below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/long-url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                {shortUrl && (
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
                    onClick={() => copyToClipboard(shortUrl)}
                    size="sm"
                    variant="outline"
                    className="ml-2 flex-shrink-0"
                    aria-label="Copy to clipboard"
                    >
                    <Copy className="h-4 w-4" />
                    </Button>
                </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleCreateShortLink} disabled={!newUrl || isCreatingLink}>
                  {isCreatingLink ? "Creating..." : "Create Short Link"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all your shortened links</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Links</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLinks}</div>
              <p className="text-xs text-muted-foreground">Total shortened URLs created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular Link</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mostClickedLink?.clicks} clicks</div>
              <p className="text-xs text-muted-foreground truncate">{truncateUrl(mostClickedLink?.originalUrl)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Shortened Links</CardTitle>
              <CardDescription>Manage and track all your shortened URLs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short URL</TableHead>
                    <TableHead className="hidden md:table-cell">Original URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="hidden md:table-cell">Last Click</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.shortUrl}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="truncate block max-w-[200px]" title={link.originalUrl}>
                          {truncateUrl(link.originalUrl)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{link.clicks}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDistanceToNow(new Date(link.lastClickedAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`http://localhost:3000/${link.shortUrl}`)}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`http://localhost:3000/${link.shortUrl}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Visit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              toast.success("Link deleted")
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Click Statistics</DialogTitle>
            <DialogDescription>
              Detailed information about clicks for {selectedLink?.shortUrl}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedLink?.clickStats && selectedLink.clickStats.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedLink.clickStats.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Set(selectedLink.clickStats.map(click => click.ip)).size}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Device</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedLink.clickStats.slice(0, 5).map((click) => (
                          <TableRow key={click.id}>
                            <TableCell>
                              {formatDistanceToNow(new Date(click.clickedAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>{click.ip}</TableCell>
                            <TableCell className="truncate max-w-[200px]">
                              {click.userAgent}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No click data available yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
