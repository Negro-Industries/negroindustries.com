export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-gray-900 mb-6'>
            GitHub Monitor
          </h1>
          <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
            Automatically generate blog posts and social media content from your
            GitHub changelog updates. AI-powered content creation for developers
            and teams.
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {/* Admin Panel */}
          <div className='bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow'>
            <div className='text-center mb-4'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>⚙️</span>
              </div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Admin Panel
              </h2>
              <p className='text-gray-600 text-sm mb-4'>
                Manage GitHub organizations and repositories for monitoring
              </p>
            </div>
            <div className='space-y-3'>
              <a
                href='/admin'
                className='block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'
              >
                Manage Organizations
              </a>
              <div className='text-xs text-gray-500 text-center'>
                Add organizations, configure monitoring settings
              </div>
            </div>
          </div>

          {/* Generated Content */}
          <div className='bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow'>
            <div className='text-center mb-4'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>📝</span>
              </div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Generated Content
              </h2>
              <p className='text-gray-600 text-sm mb-4'>
                View and copy AI-generated blog posts and social media content
              </p>
            </div>
            <div className='space-y-3'>
              <a
                href='/content'
                className='block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors'
              >
                View Content
              </a>
              <div className='text-xs text-gray-500 text-center'>
                Blog posts, Twitter, LinkedIn, Facebook content
              </div>
            </div>
          </div>

          {/* Repository Management */}
          <div className='bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow'>
            <div className='text-center mb-4'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>📁</span>
              </div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Repository Setup
              </h2>
              <p className='text-gray-600 text-sm mb-4'>
                Configure individual repositories and webhook settings
              </p>
            </div>
            <div className='space-y-3'>
              <a
                href='/repos'
                className='block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 transition-colors'
              >
                Manage Repositories
              </a>
              <div className='text-xs text-gray-500 text-center'>
                Individual repo settings and webhook configuration
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className='mt-16 bg-white rounded-lg shadow-lg p-8'>
          <h2 className='text-2xl font-bold text-center text-gray-900 mb-8'>
            🚀 Features
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='text-3xl mb-2'>🤖</div>
              <h3 className='font-semibold text-gray-900 mb-1'>
                AI Content Generation
              </h3>
              <p className='text-sm text-gray-600'>
                Automatically generate blog posts and social media content
              </p>
            </div>
            <div className='text-center'>
              <div className='text-3xl mb-2'>📱</div>
              <h3 className='font-semibold text-gray-900 mb-1'>
                Multi-Platform
              </h3>
              <p className='text-sm text-gray-600'>
                Content optimized for Twitter, LinkedIn, and Facebook
              </p>
            </div>
            <div className='text-center'>
              <div className='text-3xl mb-2'>🔗</div>
              <h3 className='font-semibold text-gray-900 mb-1'>
                GitHub Integration
              </h3>
              <p className='text-sm text-gray-600'>
                Monitors changelog updates via webhooks
              </p>
            </div>
            <div className='text-center'>
              <div className='text-3xl mb-2'>📊</div>
              <h3 className='font-semibold text-gray-900 mb-1'>
                Telegram Notifications
              </h3>
              <p className='text-sm text-gray-600'>
                Get instant notifications with generated content
              </p>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className='mt-16 bg-gray-50 rounded-lg p-8'>
          <h2 className='text-2xl font-bold text-center text-gray-900 mb-6'>
            🛠️ Quick Setup
          </h2>
          <div className='grid md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold'>
                1
              </div>
              <h3 className='font-semibold mb-2'>Add Organizations</h3>
              <p className='text-sm text-gray-600'>
                Use the admin panel to add your GitHub organizations
              </p>
            </div>
            <div className='text-center'>
              <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold'>
                2
              </div>
              <h3 className='font-semibold mb-2'>Configure Webhooks</h3>
              <p className='text-sm text-gray-600'>
                Set up webhooks in GitHub to monitor changelog updates
              </p>
            </div>
            <div className='text-center'>
              <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold'>
                3
              </div>
              <h3 className='font-semibold mb-2'>Start Creating</h3>
              <p className='text-sm text-gray-600'>
                Update your CHANGELOG.md and get AI-generated content!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
