import { Suspense } from 'react';
import { ContentViewer } from '@/components/content-viewer';

export default function ContentPage() {
  return (
    <div className='min-h-screen bg-black crt-screen p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* ASCII Header */}
        <div className='mb-8 text-center'>
          <pre className='font-mono text-xs neon-green leading-tight'>
            {`
 ██████╗ ██████╗ ███╗   ██╗████████╗███████╗███╗   ██╗████████╗     █████╗ ██████╗  ██████╗██╗  ██╗██╗██╗   ██╗███████╗
██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝████╗  ██║╚══██╔══╝    ██╔══██╗██╔══██╗██╔════╝██║  ██║██║██║   ██║██╔════╝
██║     ██║   ██║██╔██╗ ██║   ██║   █████╗  ██╔██╗ ██║   ██║       ███████║██████╔╝██║     ███████║██║██║   ██║█████╗  
██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██║╚██╗██║   ██║       ██╔══██║██╔══██╗██║     ██╔══██║██║╚██╗ ██╔╝██╔══╝  
╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██║ ╚████║   ██║       ██║  ██║██║  ██║╚██████╗██║  ██║██║ ╚████╔╝ ███████╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝
`}
          </pre>
          <div className='mt-4 space-y-2'>
            <h1 className='text-2xl font-mono text-green-400'>
              AI-GENERATED CONTENT ARCHIVE
            </h1>
            <p className='text-sm font-mono text-gray-400'>
              📄 Blog Posts • 📱 Social Media • 📢 Telegram Summaries
            </p>
            <p className='text-xs font-mono text-gray-500'>
              All content generated by our AI agents from GitHub changelog
              analysis
            </p>
          </div>
        </div>

        {/* Instructions Panel */}
        <div className='mb-6 bg-gray-900 border border-green-500 rounded-lg p-4'>
          <h2 className='text-lg font-mono text-green-400 mb-3 flex items-center gap-2'>
            📋 CONTENT ARCHIVE OVERVIEW
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div className='bg-gray-800 p-3 rounded border border-gray-700'>
              <div className='font-mono text-blue-400 mb-1'>
                🤖 AUTOMATED GENERATION
              </div>
              <div className='text-gray-300 text-xs'>
                Content is automatically generated when CHANGELOG.md files are
                updated in monitored repositories.
              </div>
            </div>
            <div className='bg-gray-800 p-3 rounded border border-gray-700'>
              <div className='font-mono text-yellow-400 mb-1'>
                📊 MULTI-PLATFORM READY
              </div>
              <div className='text-gray-300 text-xs'>
                Each entry includes blog posts, Twitter/X, LinkedIn, Facebook,
                and Telegram content.
              </div>
            </div>
            <div className='bg-gray-800 p-3 rounded border border-gray-700'>
              <div className='font-mono text-purple-400 mb-1'>
                📋 COPY & PASTE READY
              </div>
              <div className='text-gray-300 text-xs'>
                All content is formatted and ready to copy directly to your
                platforms.
              </div>
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className='bg-gray-900 border border-green-500 rounded-lg p-4'>
          <Suspense
            fallback={
              <div className='text-center py-12'>
                <div className='animate-pulse text-green-400 font-mono'>
                  ⚡ LOADING CONTENT ARCHIVE...
                </div>
                <div className='text-xs text-gray-500 mt-2 font-mono'>
                  Accessing AI-generated content database...
                </div>
              </div>
            }
          >
            <ContentViewer />
          </Suspense>
        </div>

        {/* Footer Info */}
        <div className='mt-8 text-center'>
          <div className='text-xs font-mono text-gray-500'>
            ┌─────────────────────────────────────────────────────────────────────────┐
            <br />
            │ CONTENT GENERATED BY NEGRO INDUSTRIES AI AGENTS • REAL-TIME
            MONITORING │
            <br />
            │ ALL CONTENT IS AUTOMATICALLY ANALYZED AND OPTIMIZED FOR ENGAGEMENT
            │
            <br />
            │ POWERED BY LLAMA, GROQ, AND CLAUDE AI MODELS • QUALITY ASSURED │
            <br />
            └─────────────────────────────────────────────────────────────────────────┘
          </div>
        </div>
      </div>
    </div>
  );
}
