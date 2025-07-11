import { Suspense } from 'react';
import { ContentViewer } from '@/components/content-viewer';

export default function ContentPage() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Generated Content
          </h1>
          <p className='text-gray-600'>
            AI-generated blog posts and social media content from your GitHub
            changelog updates.
          </p>
        </div>

        <Suspense
          fallback={
            <div className='animate-pulse bg-gray-200 h-96 rounded-lg' />
          }
        >
          <ContentViewer />
        </Suspense>
      </div>
    </div>
  );
}
