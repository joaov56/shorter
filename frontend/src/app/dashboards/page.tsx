'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardContent from './components/dashboard-content';

type Click = {
  id: string;
  shortUrl: string;
  clickedAt: string;
  ip: string;
  userAgent: string;
};

type Link = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  lastClickedAt: string;
  stats: Click[];
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<Link[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [mostClickedLink, setMostClickedLink] = useState<Link | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`http://localhost:8080/api/dashboard/${session.user.email}`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await response.json();

        if(!data.links) {
          setLinks([]);
          setTotalClicks(0);
          setTotalLinks(0);
          setMostClickedLink(null);
          return;
        }
        
        // Transform the data to match the frontend types
        const transformedLinks = data.links?.map((link : {
          url: {
            id: string;
            long_url: string;
            short_url: string;
            clicked_at: string;
            created_at: string;
          };
          stats: Click[];
        }) => ({
          id: link.url.id,
          originalUrl: link.url.long_url,
          shortUrl: link.url.short_url,
          clicks: link.stats?.length,
          createdAt: link.url.created_at,
          lastClickedAt: link.stats?.length > 0 
            ? link.stats[0]?.clicked_at 
            : link.url.created_at,
          stats: link.stats,
        }));

        setLinks(transformedLinks);
        setTotalClicks(data.totalClicks);
        setTotalLinks(data.totalLinks);
        
        if (data.mostClickedLink) {
          const mostClicked = transformedLinks?.find(
            (link: Link) => link.shortUrl === data.mostClickedLink.short_url
          );
          setMostClickedLink(mostClicked || null);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.email]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DashboardContent
      links={links}
      totalClicks={totalClicks}
      totalLinks={totalLinks}
      mostClickedLink={mostClickedLink || links[0]}
    />
  );
}
