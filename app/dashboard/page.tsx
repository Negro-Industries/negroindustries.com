'use client';

import { ContentViewer } from '@/components/content-viewer';
import { useState, useEffect } from 'react';

interface AgentActivity {
  id: string;
  repository_full_name: string;
  blog_title: string;
  generation_timestamp: string;
  commit_sha?: string;
  commit_message?: string;
  generation_model?: string;
}

interface DashboardStats {
  totalContent: number;
  repositories: number;
  recentActivity: number;
  activeAgents: number;
}

export default function DashboardPage() {
  const [recentActivity, setRecentActivity] = useState<AgentActivity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalContent: 0,
    repositories: 0,
    recentActivity: 0,
    activeAgents: 6, // Our 6 AI agents
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/content?limit=10');
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.content || []);
        setStats({
          totalContent: data.stats?.total || 0,
          repositories: data.stats?.repositories || 0,
          recentActivity: data.stats?.recent || 0,
          activeAgents: 6,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAgentName = (model?: string) => {
    if (!model) return 'SYSTEM';
    if (model.includes('llama')) return 'DOT MATRIX';
    if (model.includes('groq')) return 'REPO ROCCO';
    if (model.includes('claude')) return 'CHANGO';
    return 'LOLA LINGO';
  };

  const getActivityType = (activity: AgentActivity) => {
    if (activity.commit_sha) return 'CHANGELOG_ANALYSIS';
    return 'CONTENT_GENERATION';
  };

  return (
    <div className='min-h-screen bg-black crt-screen p-4'>
      {/* ASCII Art Header */}
      <div className='mb-8 text-center'>
        <pre className='font-mono text-xs neon-green leading-tight'>
          {`
███╗   ██╗███████╗ ██████╗ ██████╗  ██████╗     ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗
████╗  ██║██╔════╝██╔════╝ ██╔══██╗██╔═══██╗    ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝
██╔██╗ ██║█████╗  ██║  ███╗██████╔╝██║   ██║    ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗
██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║   ██║    ██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║
██║ ╚████║███████╗╚██████╔╝██║  ██║╚██████╔╝    ██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║
╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝     ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
`}
        </pre>
        <div className='mt-2 text-xs font-mono text-muted-foreground'>
          AI CONTENT GENERATION PLATFORM • MICHELIN-STAR DIGITAL KITCHEN • LIVE
          AGENT MONITORING
        </div>
      </div>

      {/* System Stats Panel */}
      <div className='mb-6 bg-gray-900 border border-green-500 rounded-lg p-4'>
        <h2 className='text-lg font-mono text-green-400 mb-4 flex items-center gap-2'>
          ⚡ SYSTEM STATUS
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-mono text-green-400'>
              {loading ? '...' : stats.totalContent}
            </div>
            <div className='text-xs text-gray-400'>CONTENT GENERATED</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-mono text-blue-400'>
              {loading ? '...' : stats.repositories}
            </div>
            <div className='text-xs text-gray-400'>REPOSITORIES</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-mono text-yellow-400'>
              {loading ? '...' : stats.recentActivity}
            </div>
            <div className='text-xs text-gray-400'>RECENT (7 DAYS)</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-mono text-purple-400'>
              {stats.activeAgents}
            </div>
            <div className='text-xs text-gray-400'>ACTIVE AGENTS</div>
          </div>
        </div>
      </div>

      {/* Agent Activity Feed */}
      <div className='mb-6 bg-gray-900 border border-green-500 rounded-lg p-4'>
        <h2 className='text-lg font-mono text-green-400 mb-4 flex items-center gap-2'>
          📡 LIVE AGENT ACTIVITY
        </h2>
        <div className='space-y-2 max-h-64 overflow-y-auto'>
          {loading ? (
            <div className='text-center text-gray-400 py-8'>
              <div className='animate-pulse'>LOADING AGENT ACTIVITY...</div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className='text-center text-gray-400 py-8'>
              <div>NO RECENT ACTIVITY</div>
              <div className='text-xs mt-2'>
                Agents are standing by for new commits...
              </div>
            </div>
          ) : (
            recentActivity.map(activity => (
              <div
                key={activity.id}
                className='flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-700'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-4 text-sm'>
                    <span className='font-mono text-green-400'>
                      {getAgentName(activity.generation_model)}
                    </span>
                    <span className='text-blue-400'>
                      {getActivityType(activity)}
                    </span>
                    <span className='text-gray-400'>
                      📁 {activity.repository_full_name}
                    </span>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    📝 {activity.blog_title}
                  </div>
                  {activity.commit_sha && (
                    <div className='text-xs text-gray-500 mt-1'>
                      🔗 {activity.commit_sha.substring(0, 7)} •{' '}
                      {activity.commit_message}
                    </div>
                  )}
                </div>
                <div className='text-xs text-gray-400 font-mono'>
                  {formatDate(activity.generation_timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agent Team Status */}
      <div className='mb-6 bg-gray-900 border border-green-500 rounded-lg p-4'>
        <h2 className='text-lg font-mono text-green-400 mb-4 flex items-center gap-2'>
          👥 AGENT TEAM STATUS
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[
            {
              name: 'DOT MATRIX',
              role: 'Project Chef',
              status: 'READY',
              specialty: 'PRD Analysis',
            },
            {
              name: 'REPO ROCCO',
              role: 'Code Scaffolder',
              status: 'READY',
              specialty: 'Repository Setup',
            },
            {
              name: 'CHANGO',
              role: 'Hype Machine',
              status: 'READY',
              specialty: 'Social Media',
            },
            {
              name: 'LOLA LINGO',
              role: 'Storyteller',
              status: 'READY',
              specialty: 'Content Creation',
            },
            {
              name: 'STACK JACK',
              role: 'Infra Boss',
              status: 'READY',
              specialty: 'Deployment',
            },
            {
              name: 'BOSS LADY',
              role: 'Payment Closer',
              status: 'READY',
              specialty: 'Billing & Upgrades',
            },
          ].map((agent, index) => (
            <div
              key={index}
              className='bg-gray-800 p-3 rounded border border-gray-700'
            >
              <div className='flex items-center justify-between mb-2'>
                <span className='font-mono text-green-400 text-sm'>
                  {agent.name}
                </span>
                <span className='text-xs text-green-400'>● {agent.status}</span>
              </div>
              <div className='text-xs text-gray-400'>{agent.role}</div>
              <div className='text-xs text-gray-500'>{agent.specialty}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Content Viewer */}
      <div className='bg-gray-900 border border-green-500 rounded-lg p-4'>
        <h2 className='text-lg font-mono text-green-400 mb-4 flex items-center gap-2'>
          📄 GENERATED CONTENT ARCHIVE
        </h2>
        <ContentViewer />
      </div>

      {/* Footer */}
      <div className='mt-8 text-center'>
        <div className='text-xs font-mono text-muted-foreground'>
          ┌─────────────────────────────────────────────────────────────────────────┐
          <br />
          │ NEGRO INDUSTRIES AI ORCHESTRATION PLATFORM • REAL-TIME MONITORING │
          <br />
          │ ALL AGENT ACTIVITIES ARE LOGGED AND MONITORED FOR QUALITY ASSURANCE
          │
          <br />
          │ TRANSPARENT AI WORKFLOWS • HUMAN-IN-THE-LOOP APPROVAL SYSTEM │
          <br />
          └─────────────────────────────────────────────────────────────────────────┘
        </div>
      </div>
    </div>
  );
}
