import DashboardContent from "./components/dashboard-content"

export default function Dashboard() {
  // This would be replaced with actual data fetching from your database
  const mockUserLinks = [
    {
      id: "1",
      originalUrl: "https://example.com/very/long/url/that/needs/shortening/for/better/sharing",
      shortUrl: "link.sh/abc123",
      clicks: 245,
      createdAt: "2023-10-15T10:30:00Z",
      lastClickedAt: "2023-11-01T14:22:00Z",
    },
    {
      id: "2",
      originalUrl: "https://anotherexample.com/blog/how-to-create-shortened-urls",
      shortUrl: "link.sh/def456",
      clicks: 189,
      createdAt: "2023-10-18T09:15:00Z",
      lastClickedAt: "2023-11-01T08:45:00Z",
    },
    {
      id: "3",
      originalUrl: "https://longwebsiteaddress.com/article/why-url-shorteners-are-useful-for-marketing",
      shortUrl: "link.sh/ghi789",
      clicks: 327,
      createdAt: "2023-10-10T14:20:00Z",
      lastClickedAt: "2023-11-01T16:30:00Z",
    },
    {
      id: "4",
      originalUrl: "https://examplewebsite.com/products/new-release",
      shortUrl: "link.sh/jkl012",
      clicks: 92,
      createdAt: "2023-10-25T11:45:00Z",
      lastClickedAt: "2023-10-31T19:10:00Z",
    },
  ]

  const totalClicks = mockUserLinks.reduce((sum, link) => sum + link.clicks, 0)
  const totalLinks = mockUserLinks.length
  const mostClickedLink = [...mockUserLinks].sort((a, b) => b.clicks - a.clicks)[0]

  return (
    <DashboardContent
      links={mockUserLinks}
      totalClicks={totalClicks}
      totalLinks={totalLinks}
      mostClickedLink={mostClickedLink}
    />
  )
}
