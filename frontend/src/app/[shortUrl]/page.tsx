'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: {
    shortUrl: string;
  };
}

export default function RedirectPage({ params }: PageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOriginalUrl = async () => {
      try {
        // First increment the click count
        await fetch(`http://localhost:8080/api/url/${params.shortUrl}/click`, {
          method: 'POST',
        });

        // Then fetch the original URL
        const response = await fetch(`http://localhost:8080/api/url/${params.shortUrl}`);
        
        if (!response.ok) {
          throw new Error('URL not found');
        }

        const data = await response.json();
        
        // Redirect to the original URL
        window.location.href = data.long_url;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'URL not found or invalid');
        setLoading(false);
      }
    };

    fetchOriginalUrl();
  }, [params.shortUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
} 