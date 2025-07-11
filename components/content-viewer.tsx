'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ContentEntry {
  id: string;
  timestamp: string;
  repository: string;
  blogPost: {
    title: string;
    description: string;
    body: string;
    tags: string[];
  };
  socialMedia: {
    twitter: string;
    linkedin: string;
    facebook: string;
  };
}

export function ContentViewer() {
  const [content, setContent] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentEntry | null>(
    null
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content?limit=20');
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (loading) {
    return <div className='animate-pulse bg-gray-200 h-96 rounded-lg' />;
  }

  if (content.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500 text-lg mb-4'>No content generated yet.</p>
        <p className='text-gray-400'>
          Make a commit with CHANGELOG.md changes to a monitored repository to
          generate content.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Content List */}
      {!selectedContent && (
        <div className='grid gap-4'>
          {content.map(entry => (
            <div
              key={entry.id}
              className='bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => setSelectedContent(entry)}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='font-semibold text-lg text-gray-900 mb-2'>
                    {entry.blogPost.title}
                  </h3>
                  <p className='text-gray-600 mb-3 line-clamp-2'>
                    {entry.blogPost.description}
                  </p>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <span>📁 {entry.repository}</span>
                    <span>🕒 {new Date(entry.timestamp).toLocaleString()}</span>
                    <span>🏷️ {entry.blogPost.tags.length} tags</span>
                  </div>
                </div>
                <Button variant='outline' size='sm'>
                  View Content →
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Content View */}
      {selectedContent && (
        <div className='space-y-6'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' onClick={() => setSelectedContent(null)}>
              ← Back to List
            </Button>
            <div className='text-sm text-gray-500'>
              📁 {selectedContent.repository} • 🕒{' '}
              {new Date(selectedContent.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Blog Post Section */}
          <div className='bg-white p-6 rounded-lg border border-gray-200'>
            <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              🌐 Blog Post
            </h2>

            <div className='space-y-4'>
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Title
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.blogPost.title,
                        'blog-title'
                      )
                    }
                  >
                    {copiedField === 'blog-title' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.blogPost.title}
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Meta Description
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.blogPost.description,
                        'blog-description'
                      )
                    }
                  >
                    {copiedField === 'blog-description' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.blogPost.description}
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Tags
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.blogPost.tags.join(', '),
                        'blog-tags'
                      )
                    }
                  >
                    {copiedField === 'blog-tags' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.blogPost.tags.join(', ')}
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Body (Markdown)
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.blogPost.body,
                        'blog-body'
                      )
                    }
                  >
                    {copiedField === 'blog-body' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm max-h-64 overflow-y-auto'>
                  <pre className='whitespace-pre-wrap font-mono text-xs'>
                    {selectedContent.blogPost.body}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className='bg-white p-6 rounded-lg border border-gray-200'>
            <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              📱 Social Media Posts
            </h2>

            <div className='space-y-6'>
              {/* Twitter */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                    🐦 Twitter/X
                    <span className='text-xs text-gray-500'>
                      ({selectedContent.socialMedia.twitter.length}/280 chars)
                    </span>
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.socialMedia.twitter,
                        'twitter'
                      )
                    }
                  >
                    {copiedField === 'twitter' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.socialMedia.twitter}
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                    💼 LinkedIn
                    <span className='text-xs text-gray-500'>
                      ({selectedContent.socialMedia.linkedin.length}/1300 chars)
                    </span>
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.socialMedia.linkedin,
                        'linkedin'
                      )
                    }
                  >
                    {copiedField === 'linkedin' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm max-h-32 overflow-y-auto'>
                  {selectedContent.socialMedia.linkedin}
                </div>
              </div>

              {/* Facebook */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                    📘 Facebook Business Page
                    <span className='text-xs text-gray-500'>
                      ({selectedContent.socialMedia.facebook.length}/500 chars)
                    </span>
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.socialMedia.facebook,
                        'facebook'
                      )
                    }
                  >
                    {copiedField === 'facebook' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.socialMedia.facebook}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
            <h3 className='font-medium text-blue-900 mb-2'>✨ Quick Actions</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <Button
                variant='outline'
                onClick={() =>
                  copyToClipboard(
                    selectedContent.blogPost.title +
                      '\n\n' +
                      selectedContent.blogPost.body,
                    'full-blog'
                  )
                }
                className='text-left justify-start'
              >
                📄 Copy Full Blog Post
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  copyToClipboard(
                    `Twitter: ${selectedContent.socialMedia.twitter}\n\nLinkedIn: ${selectedContent.socialMedia.linkedin}\n\nFacebook: ${selectedContent.socialMedia.facebook}`,
                    'all-social'
                  )
                }
                className='text-left justify-start'
              >
                📱 Copy All Social Media
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  copyToClipboard(
                    selectedContent.blogPost.tags.join(', '),
                    'just-tags'
                  )
                }
                className='text-left justify-start'
              >
                🏷️ Copy Tags Only
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
