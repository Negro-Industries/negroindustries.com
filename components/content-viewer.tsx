'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GeneratedContent } from '@/types/generated-content';

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
    return (
      <div className='text-center py-12'>
        <div className='animate-pulse text-green-400 font-mono text-lg'>
          ⚡ SCANNING CONTENT DATABASE...
        </div>
        <div className='text-xs text-gray-500 mt-2 font-mono'>
          Analyzing AI-generated content...
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className='text-center py-12 bg-gray-800 rounded-lg border border-gray-700'>
        <div className='text-green-400 font-mono text-lg mb-4'>
          📭 NO CONTENT DETECTED
        </div>
        <div className='text-gray-400 font-mono text-sm mb-2'>
          Agents are standing by for new changelog updates...
        </div>
        <div className='text-gray-500 font-mono text-xs'>
          Make a commit with CHANGELOG.md changes to a monitored repository to
          generate content.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats Section */}
      {stats && !selectedContent && (
        <div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
          <h2 className='text-lg font-mono text-green-400 mb-4 flex items-center gap-2'>
            📊 CONTENT STATISTICS
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center bg-gray-900 p-4 rounded border border-gray-600'>
              <div className='text-2xl font-mono text-blue-400'>
                {stats.total}
              </div>
              <div className='text-xs text-gray-400 font-mono'>
                TOTAL GENERATED
              </div>
            </div>
            <div className='text-center bg-gray-900 p-4 rounded border border-gray-600'>
              <div className='text-2xl font-mono text-green-400'>
                {stats.repositories}
              </div>
              <div className='text-xs text-gray-400 font-mono'>
                REPOSITORIES
              </div>
            </div>
            <div className='text-center bg-gray-900 p-4 rounded border border-gray-600'>
              <div className='text-2xl font-mono text-purple-400'>
                {stats.recent}
              </div>
              <div className='text-xs text-gray-400 font-mono'>LAST 7 DAYS</div>
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
              className='bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors cursor-pointer'
              onClick={() => setSelectedContent(entry)}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='font-mono text-lg text-green-400 mb-2'>
                    📄 {entry.blog_title}
                  </h3>
                  <p className='text-gray-300 mb-3 line-clamp-2 font-mono text-sm'>
                    {entry.blog_description}
                  </p>
                  <div className='flex items-center gap-4 text-xs text-gray-400 mb-2 font-mono'>
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
                    <div className='flex items-center gap-4 text-xs text-gray-500 font-mono'>
                      <span>🔗 {entry.commit_sha.substring(0, 7)}</span>
                      {entry.commit_message && (
                        <span className='truncate max-w-md'>
                          💬 {entry.commit_message}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono'
                >
                  VIEW CONTENT →
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
            <Button
              variant='outline'
              onClick={() => setSelectedContent(null)}
              className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono'
            >
              ← BACK TO LIST
            </Button>
            <div className='text-sm text-gray-400 font-mono'>
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
            <div className='bg-gray-800 p-4 rounded-lg border border-gray-700'>
              <h3 className='font-mono text-green-400 mb-2 flex items-center gap-2'>
                🔗 COMMIT INFORMATION
              </h3>
              <div className='space-y-2 text-sm font-mono'>
                <div className='text-gray-300'>
                  <span className='text-blue-400'>SHA:</span>{' '}
                  <span className='text-yellow-400'>
                    {selectedContent.commit_sha}
                  </span>
                </div>
                {selectedContent.commit_message && (
                  <div className='text-gray-300'>
                    <span className='text-blue-400'>Message:</span>{' '}
                    <span className='text-gray-200'>
                      {selectedContent.commit_message}
                    </span>
                  </div>
                )}
                {selectedContent.generation_model && (
                  <div className='text-gray-300'>
                    <span className='text-blue-400'>Generated by:</span>{' '}
                    <span className='text-purple-400'>
                      {selectedContent.generation_model}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blog Post Section */}
          <div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
            <h2 className='text-xl font-mono text-green-400 mb-4 flex items-center gap-2'>
              🌐 BLOG POST CONTENT
            </h2>

            <div className='space-y-4'>
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-mono text-blue-400'>
                    TITLE
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(selectedContent.blog_title, 'blog-title')
                    }
                    className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                  >
                    {copiedField === 'blog-title' ? 'COPIED!' : 'COPY'}
                  </Button>
                </div>
                <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm font-mono text-gray-200'>
                  {selectedContent.blog_title}
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-mono text-blue-400'>
                    META DESCRIPTION
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
                    className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                  >
                    {copiedField === 'blog-description' ? 'COPIED!' : 'COPY'}
                  </Button>
                </div>
                <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm font-mono text-gray-200'>
                  {selectedContent.blog_description}
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-mono text-blue-400'>
                    TAGS
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
                    className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                  >
                    {copiedField === 'blog-tags' ? 'COPIED!' : 'COPY'}
                  </Button>
                </div>
                <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm font-mono text-gray-200'>
                  {selectedContent.blog_tags.join(', ')}
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-mono text-blue-400'>
                    BODY (MARKDOWN)
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(selectedContent.blog_body, 'blog-body')
                    }
                    className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                  >
                    {copiedField === 'blog-body' ? 'COPIED!' : 'COPY'}
                  </Button>
                </div>
                <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm max-h-64 overflow-y-auto'>
                  <pre className='whitespace-pre-wrap font-mono text-xs text-gray-200'>
                    {selectedContent.blog_body}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
            <h2 className='text-xl font-mono text-green-400 mb-4 flex items-center gap-2'>
              📱 SOCIAL MEDIA POSTS
            </h2>

            <div className='space-y-6'>
              {/* Twitter */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-mono text-blue-400 flex items-center gap-2'>
                    🐦 TWITTER/X
                    <span className='text-xs text-gray-400'>
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
                    className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                  >
                    {copiedField === 'twitter' ? 'COPIED!' : 'COPY'}
                  </Button>
                </div>
                <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm font-mono text-gray-200'>
                  {selectedContent.twitter_content}
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-mono text-blue-400 flex items-center gap-2'>
                    💼 LINKEDIN
                    <span className='text-xs text-gray-400'>
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
                    className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                  >
                    {copiedField === 'linkedin' ? 'COPIED!' : 'COPY'}
                  </Button>
                </div>
                <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm max-h-32 overflow-y-auto font-mono text-gray-200'>
                  {selectedContent.linkedin_content}
                </div>
              </div>

              {/* Facebook */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-mono text-blue-400 flex items-center gap-2'>
                    📘 FACEBOOK
                    <span className='text-xs text-gray-400'>
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
                    className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                  >
                    {copiedField === 'facebook' ? 'COPIED!' : 'COPY'}
                  </Button>
                </div>
                <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm font-mono text-gray-200'>
                  {selectedContent.facebook_content}
                </div>
              </div>
            </div>
          </div>

          {/* Telegram Summary Section */}
          {selectedContent.telegram_summary && (
            <div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
              <h2 className='text-xl font-mono text-green-400 mb-4 flex items-center gap-2'>
                📢 TELEGRAM SUMMARY
              </h2>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-mono text-blue-400'>
                  GENERATED SUMMARY
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
                  className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                >
                  {copiedField === 'telegram-summary' ? 'COPIED!' : 'COPY'}
                </Button>
              </div>
              <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm max-h-48 overflow-y-auto'>
                <pre className='whitespace-pre-wrap font-mono text-xs text-gray-200'>
                  {selectedContent.telegram_summary}
                </pre>
              </div>
            </div>
          )}

          {/* Source Diff Section */}
          {selectedContent.source_diff && (
            <div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
              <h2 className='text-xl font-mono text-green-400 mb-4 flex items-center gap-2'>
                📋 SOURCE DIFF
              </h2>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-mono text-blue-400'>
                  CHANGELOG.MD CHANGES
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
                  className='bg-gray-700 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs'
                >
                  {copiedField === 'source-diff' ? 'COPIED!' : 'COPY'}
                </Button>
              </div>
              <div className='bg-gray-900 p-3 rounded border border-gray-600 text-sm max-h-48 overflow-y-auto'>
                <pre className='whitespace-pre-wrap font-mono text-xs text-gray-200'>
                  {selectedContent.source_diff}
                </pre>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className='bg-blue-900 p-4 rounded-lg border border-blue-600'>
            <h3 className='font-mono text-blue-400 mb-2 flex items-center gap-2'>
              ⚡ QUICK ACTIONS
            </h3>
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
                className='text-left justify-start bg-gray-700 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-black font-mono text-xs'
              >
                📄 COPY FULL BLOG POST
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  copyToClipboard(
                    `Twitter: ${selectedContent.twitter_content}\n\nLinkedIn: ${selectedContent.linkedin_content}\n\nFacebook: ${selectedContent.facebook_content}`,
                    'all-social'
                  )
                }
                className='text-left justify-start bg-gray-700 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-black font-mono text-xs'
              >
                📱 COPY ALL SOCIAL MEDIA
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  copyToClipboard(
                    selectedContent.blog_tags.join(', '),
                    'just-tags'
                  )
                }
                className='text-left justify-start bg-gray-700 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-black font-mono text-xs'
              >
                🏷️ COPY TAGS ONLY
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
