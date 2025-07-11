import { Suspense } from 'react';
import { OrganizationManager } from '@/components/organization-manager';

export default function AdminPage() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            GitHub Monitor Admin
          </h1>
          <p className='text-gray-600'>
            Manage GitHub organizations and repositories for changelog
            monitoring.
          </p>
        </div>

        <Suspense
          fallback={
            <div className='animate-pulse bg-gray-200 h-96 rounded-lg' />
          }
        >
          <OrganizationManager />
        </Suspense>
      </div>
    </div>
  );
}
