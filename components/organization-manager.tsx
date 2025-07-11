'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface OrganizationConfig {
  name: string;
  enabled: boolean;
  includePrivate: boolean;
  excludeRepos: string[];
  lastSyncTime?: string;
}

export function OrganizationManager() {
  const [organizations, setOrganizations] = useState<OrganizationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrgName, setNewOrgName] = useState('');
  const [includePrivate, setIncludePrivate] = useState(false);
  const [excludeRepos, setExcludeRepos] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/orgs');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/manage-orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          name: newOrgName.trim(),
          includePrivate,
          excludeRepos: excludeRepos
            .split(',')
            .map(repo => repo.trim())
            .filter(Boolean),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setNewOrgName('');
        setIncludePrivate(false);
        setExcludeRepos('');
        fetchOrganizations();
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to add organization',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOrganization = async (orgName: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/manage-orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: enabled ? 'disable' : 'enable',
          name: orgName,
        }),
      });

      if (response.ok) {
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Failed to toggle organization:', error);
    }
  };

  const removeOrganization = async (orgName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${orgName} and all its repositories?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/manage-orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          name: orgName,
        }),
      });

      if (response.ok) {
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Failed to remove organization:', error);
    }
  };

  if (loading) {
    return <div className='animate-pulse bg-gray-200 h-96 rounded-lg' />;
  }

  return (
    <div className='space-y-8'>
      {/* Add Organization Form */}
      <div className='bg-white p-6 rounded-lg border border-gray-200'>
        <h2 className='text-xl font-semibold mb-4'>Add New Organization</h2>

        <form onSubmit={addOrganization} className='space-y-4'>
          <div>
            <label
              htmlFor='orgName'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Organization Name
            </label>
            <input
              id='orgName'
              type='text'
              value={newOrgName}
              onChange={e => setNewOrgName(e.target.value)}
              placeholder='your-github-org'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          <div className='flex items-center'>
            <input
              id='includePrivate'
              type='checkbox'
              checked={includePrivate}
              onChange={e => setIncludePrivate(e.target.checked)}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <label
              htmlFor='includePrivate'
              className='ml-2 text-sm text-gray-700'
            >
              Include private repositories
            </label>
          </div>

          <div>
            <label
              htmlFor='excludeRepos'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Exclude Repositories (comma-separated)
            </label>
            <input
              id='excludeRepos'
              type='text'
              value={excludeRepos}
              onChange={e => setExcludeRepos(e.target.value)}
              placeholder='docs, archive-repo, .github'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {isSubmitting ? 'Adding...' : 'Add Organization'}
          </Button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Organizations List */}
      <div className='bg-white p-6 rounded-lg border border-gray-200'>
        <h2 className='text-xl font-semibold mb-4'>Monitored Organizations</h2>

        {organizations.length === 0 ? (
          <p className='text-gray-500 text-center py-8'>
            No organizations configured yet. Add one above to get started.
          </p>
        ) : (
          <div className='space-y-4'>
            {organizations.map(org => (
              <div
                key={org.name}
                className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <h3 className='font-medium text-gray-900'>{org.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        org.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {org.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className='mt-1 text-sm text-gray-500'>
                    <span>
                      Private repos:{' '}
                      {org.includePrivate ? 'Included' : 'Excluded'}
                    </span>
                    {org.excludeRepos.length > 0 && (
                      <span className='ml-4'>
                        Excluded: {org.excludeRepos.join(', ')}
                      </span>
                    )}
                  </div>

                  {org.lastSyncTime && (
                    <div className='mt-1 text-xs text-gray-400'>
                      Last synced: {new Date(org.lastSyncTime).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => toggleOrganization(org.name, org.enabled)}
                  >
                    {org.enabled ? 'Disable' : 'Enable'}
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => removeOrganization(org.name)}
                    className='text-red-600 hover:text-red-700 hover:bg-red-50'
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Setup Instructions */}
      <div className='bg-blue-50 p-6 rounded-lg border border-blue-200'>
        <h3 className='text-lg font-semibold text-blue-900 mb-2'>
          📡 Webhook Setup Required
        </h3>
        <p className='text-blue-800 mb-3'>
          For each organization above, you need to set up a webhook in GitHub:
        </p>
        <div className='bg-white p-4 rounded border text-sm font-mono'>
          <div className='mb-2'>
            <strong>Payload URL:</strong>{' '}
            https://negroindustries.com/api/github-webhook
          </div>
          <div className='mb-2'>
            <strong>Content type:</strong> application/json
          </div>
          <div className='mb-2'>
            <strong>Events:</strong> Repositories, Pushes
          </div>
        </div>
        <p className='text-blue-700 text-sm mt-3'>
          Go to:{' '}
          <code className='bg-white px-1 rounded'>
            https://github.com/orgs/YOUR_ORG/settings/hooks
          </code>
        </p>
      </div>
    </div>
  );
}
