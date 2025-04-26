'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const router = useRouter();

  console.log('Auth Error:', { error, errorDescription });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg border p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mb-4 text-gray-600">
          {error === 'AccessDenied'
            ? 'You do not have permission to sign in.'
            : errorDescription || 'An error occurred during authentication.'}
        </p>
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Error code: {error}</p>
          {errorDescription && (
            <p className="text-sm text-gray-600 mt-2">Details: {errorDescription}</p>
          )}
        </div>
        <Button
          onClick={() => router.push('/auth/signin')}
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
} 