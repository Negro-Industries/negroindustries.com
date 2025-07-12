'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GeneratedContent } from '@/lib/types/generated-content';

interface ContentStats {
  total: number;
  repositories: number;
  recent: number;
}

interface ContentResponse {
  content: GeneratedContent[];
  stats: ContentStats;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function ContentViewer() {
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] =
    useState<GeneratedContent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content?limit=20');
      if (response.ok) {
        const data: ContentResponse = await response.json();
        setContent(data.content || []);
        setStats(data.stats);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
      {/* Stats Section */}
      {stats && !selectedContent && (
        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <h2 className='text-lg font-semibold mb-4'>📊 Content Statistics</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.total}
              </div>
              <div className='text-sm text-gray-500'>Total Generated</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {stats.repositories}
              </div>
              <div className='text-sm text-gray-500'>Repositories</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {stats.recent}
              </div>
              <div className='text-sm text-gray-500'>Last 7 Days</div>
            </div>
          </div>
        </div>
      )}

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
                    {entry.blog_title}
                  </h3>
                  <p className='text-gray-600 mb-3 line-clamp-2'>
                    {entry.blog_description}
                  </p>
                  <div className='flex items-center gap-4 text-sm text-gray-500 mb-2'>
                    <span>📁 {entry.repository_full_name}</span>
                    <span>
                      🕒{' '}
                      {formatDate(
                        entry.generation_timestamp || entry.created_at || ''
                      )}
                    </span>
                    <span>🏷️ {entry.blog_tags.length} tags</span>
                  </div>
                  {entry.commit_sha && (
                    <div className='flex items-center gap-4 text-sm text-gray-400'>
                      <span>🔗 {entry.commit_sha.substring(0, 7)}</span>
                      {entry.commit_message && (
                        <span className='truncate max-w-md'>
                          💬 {entry.commit_message}
                        </span>
                      )}
                    </div>
                  )}
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
              📁 {selectedContent.repository_full_name} • 🕒{' '}
              {formatDate(
                selectedContent.generation_timestamp ||
                  selectedContent.created_at ||
                  ''
              )}
              {selectedContent.commit_sha && (
                <> • 🔗 {selectedContent.commit_sha.substring(0, 7)}</>
              )}
            </div>
          </div>

          {/* Commit Information */}
          {selectedContent.commit_sha && (
            <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
              <h3 className='font-medium text-gray-900 mb-2'>
                🔗 Commit Information
              </h3>
              <div className='space-y-2 text-sm'>
                <div>
                  <span className='font-medium'>SHA:</span>{' '}
                  {selectedContent.commit_sha}
                </div>
                {selectedContent.commit_message && (
                  <div>
                    <span className='font-medium'>Message:</span>{' '}
                    {selectedContent.commit_message}
                  </div>
                )}
                {selectedContent.generation_model && (
                  <div>
                    <span className='font-medium'>Generated by:</span>{' '}
                    {selectedContent.generation_model}
                  </div>
                )}
              </div>
            </div>
          )}

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
                      copyToClipboard(selectedContent.blog_title, 'blog-title')
                    }
                  >
                    {copiedField === 'blog-title' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.blog_title}
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
                        selectedContent.blog_description,
                        'blog-description'
                      )
                    }
                  >
                    {copiedField === 'blog-description' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.blog_description}
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
                        selectedContent.blog_tags.join(', '),
                        'blog-tags'
                      )
                    }
                  >
                    {copiedField === 'blog-tags' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.blog_tags.join(', ')}
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
                      copyToClipboard(selectedContent.blog_body, 'blog-body')
                    }
                  >
                    {copiedField === 'blog-body' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm max-h-64 overflow-y-auto'>
                  <pre className='whitespace-pre-wrap font-mono text-xs'>
                    {selectedContent.blog_body}
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
                      ({selectedContent.twitter_content.length}/280 chars)
                    </span>
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.twitter_content,
                        'twitter'
                      )
                    }
                  >
                    {copiedField === 'twitter' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.twitter_content}
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                    💼 LinkedIn
                    <span className='text-xs text-gray-500'>
                      ({selectedContent.linkedin_content.length}/1300 chars)
                    </span>
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.linkedin_content,
                        'linkedin'
                      )
                    }
                  >
                    {copiedField === 'linkedin' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm max-h-32 overflow-y-auto'>
                  {selectedContent.linkedin_content}
                </div>
              </div>

              {/* Facebook */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                    📘 Facebook Business Page
                    <span className='text-xs text-gray-500'>
                      ({selectedContent.facebook_content.length}/500 chars)
                    </span>
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        selectedContent.facebook_content,
                        'facebook'
                      )
                    }
                  >
                    {copiedField === 'facebook' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className='bg-gray-50 p-3 rounded border text-sm'>
                  {selectedContent.facebook_content}
                </div>
              </div>
            </div>
          </div>

          {/* Telegram Summary Section */}
          {selectedContent.telegram_summary && (
            <div className='bg-white p-6 rounded-lg border border-gray-200'>
              <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                📢 Telegram Summary
              </h2>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-medium text-gray-700'>
                  Generated Summary
                </label>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(
                      selectedContent.telegram_summary,
                      'telegram-summary'
                    )
                  }
                >
                  {copiedField === 'telegram-summary' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className='bg-gray-50 p-3 rounded border text-sm max-h-48 overflow-y-auto'>
                <pre className='whitespace-pre-wrap font-mono text-xs'>
                  {selectedContent.telegram_summary}
                </pre>
              </div>
            </div>
          )}

          {/* Source Diff Section */}
          {selectedContent.source_diff && (
            <div className='bg-white p-6 rounded-lg border border-gray-200'>
              <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                📋 Source Diff
              </h2>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-medium text-gray-700'>
                  CHANGELOG.md Changes
                </label>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(
                      selectedContent.source_diff || '',
                      'source-diff'
                    )
                  }
                >
                  {copiedField === 'source-diff' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className='bg-gray-50 p-3 rounded border text-sm max-h-48 overflow-y-auto'>
                <pre className='whitespace-pre-wrap font-mono text-xs'>
                  {selectedContent.source_diff}
                </pre>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
            <h3 className='font-medium text-blue-900 mb-2'>✨ Quick Actions</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <Button
                variant='outline'
                onClick={() =>
                  copyToClipboard(
                    selectedContent.blog_title +
                      '\n\n' +
                      selectedContent.blog_body,
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
                    `Twitter: ${selectedContent.twitter_content}\n\nLinkedIn: ${selectedContent.linkedin_content}\n\nFacebook: ${selectedContent.facebook_content}`,
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
                    selectedContent.blog_tags.join(', '),
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
