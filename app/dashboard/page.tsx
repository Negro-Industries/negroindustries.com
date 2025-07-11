'use client';

import { AgentMonitorCard } from '@/components/agent-monitor-card';
import { SystemStatsPanel } from '@/components/system-stats-panel';
import { ActionPanel } from '@/components/action-panel';
import { TerminalLogFeed } from '@/components/terminal-log-feed';
import { useState, useEffect } from 'react';

// Mock data for demonstration
const mockAgents = [
  {
    agentName: 'BADG3R',
    taskDescription: 'CRACKING THE MATRIX... BYPASSING FIREWALL PROTOCOLS',
    progress: 87,
    eta: '02:34:12',
    status: 'active' as const,
  },
  {
    agentName: 'CYPH3R',
    taskDescription: 'EXTRACTING DATABASE SCHEMAS... ANALYZING VULNERABILITIES',
    progress: 45,
    eta: '05:12:45',
    status: 'active' as const,
  },
  {
    agentName: 'N3UR0',
    taskDescription: 'NEURAL NETWORK TRAINING COMPLETE... STANDING BY',
    progress: 100,
    eta: '00:00:00',
    status: 'complete' as const,
  },
];

const mockLogs = [
  {
    id: '1',
    timestamp: '23:42:15',
    agent: 'BADG3R',
    message: 'INITIATED DEEP SCAN ON TARGET SYSTEM... STEALTH MODE ENGAGED',
    type: 'info' as const,
  },
  {
    id: '2',
    timestamp: '23:42:18',
    agent: 'SYSTEM',
    message: 'FIREWALL BREACH DETECTED... REROUTING THROUGH PROXY CHAIN',
    type: 'warning' as const,
  },
  {
    id: '3',
    timestamp: '23:42:22',
    agent: 'CYPH3R',
    message: 'SQL INJECTION SUCCESSFUL... DUMPING USER CREDENTIALS',
    type: 'success' as const,
  },
  {
    id: '4',
    timestamp: '23:42:25',
    agent: 'N3UR0',
    message: 'MACHINE LEARNING MODEL UPDATED... ACCURACY: 99.7%',
    type: 'success' as const,
  },
  {
    id: '5',
    timestamp: '23:42:28',
    agent: 'SYSTEM',
    message: 'INTRUSION DETECTION SYSTEM BYPASSED... MAINTAINING GHOST PROFILE',
    type: 'info' as const,
  },
  {
    id: '6',
    timestamp: '23:42:31',
    agent: 'BADG3R',
    message: 'PAYLOAD DEPLOYED... ESTABLISHING BACKDOOR CONNECTION',
    type: 'success' as const,
  },
];

export default function DashboardPage() {
  const [logs, setLogs] = useState(mockLogs);
  const [systemStats, setSystemStats] = useState({
    transferSpeed: '36GB/s',
    activeTasks: 12,
    completedTasks: 8,
    totalTasks: 25,
    uptime: '72h 14m 33s',
    cpuUsage: 67,
    memoryUsage: 43,
  });

  // Simulate real-time log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        agent: ['BADG3R', 'CYPH3R', 'N3UR0', 'SYSTEM'][
          Math.floor(Math.random() * 4)
        ],
        message: [
          'SCANNING NETWORK TOPOLOGY... MAPPING ATTACK VECTORS',
          'CRYPTOGRAPHIC HASH CRACKED... ACCESSING ENCRYPTED FILES',
          'SOCIAL ENGINEERING PHASE COMPLETE... HARVESTING INTEL',
          'ZERO-DAY EXPLOIT DEPLOYED... ESCALATING PRIVILEGES',
          'PACKET SNIFFING INITIATED... INTERCEPTING COMMUNICATIONS',
          'ROOTKIT INSTALLED... MAINTAINING PERSISTENT ACCESS',
        ][Math.floor(Math.random() * 6)],
        type: (['info', 'success', 'warning'] as const)[
          Math.floor(Math.random() * 3)
        ],
      };

      setLogs(prev => [...prev.slice(-10), newLog]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate system stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpuUsage: Math.max(
          20,
          Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 20)
        ),
        memoryUsage: Math.max(
          10,
          Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 15)
        ),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = (action: string) => {
    console.log(`Action triggered: ${action}`);
    // Add your action handlers here
  };

  return (
    <div className='min-h-screen bg-black crt-screen p-4'>
      {/* ASCII Art Header */}
      <div className='mb-8 text-center'>
        <pre className='font-mono text-xs neon-green leading-tight'>
          {`
███╗   ███╗███████╗ ██████╗ ██████╗  ██████╗     ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗
████╗ ████║██╔════╝██╔════╝ ██╔══██╗██╔═══██╗    ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝
██╔████╔██║█████╗  ██║  ███╗██████╔╝██║   ██║    ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗
██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██╗██║   ██║    ██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║
██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║╚██████╔╝    ██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║
╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝     ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
`}
        </pre>
        <div className='mt-2 text-xs font-mono text-muted-foreground'>
          UNDERGROUND HACKING COLLECTIVE • EST. 1998 • PHREAKING THE MATRIX
          SINCE Y2K
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Agent Monitors */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {mockAgents.map((agent, index) => (
              <AgentMonitorCard
                key={index}
                agentName={agent.agentName}
                taskDescription={agent.taskDescription}
                progress={agent.progress}
                eta={agent.eta}
                status={agent.status}
              />
            ))}
          </div>

          {/* Terminal Log Feed */}
          <TerminalLogFeed logs={logs} />
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* System Stats */}
          <SystemStatsPanel
            transferSpeed={systemStats.transferSpeed}
            activeTasks={systemStats.activeTasks}
            completedTasks={systemStats.completedTasks}
            totalTasks={systemStats.totalTasks}
            uptime={systemStats.uptime}
            cpuUsage={systemStats.cpuUsage}
            memoryUsage={systemStats.memoryUsage}
          />

          {/* Action Panel */}
          <ActionPanel
            onCancel={() => handleAction('cancel')}
            onPause={() => handleAction('pause')}
            onClose={() => handleAction('close')}
            onRestart={() => handleAction('restart')}
          />
        </div>
      </div>

      {/* Footer */}
      <div className='mt-8 text-center'>
        <div className='text-xs font-mono text-muted-foreground'>
          ┌─────────────────────────────────────────────────────────────────────────┐
          <br />
          │ ACCESSING SECURE TERMINAL... CONNECTION ESTABLISHED VIA ENCRYPTED
          PROXY │
          <br />
          │ WARNING: UNAUTHORIZED ACCESS IS PROHIBITED BY FEDERAL LAW │
          <br />
          │ ALL ACTIVITIES ARE MONITORED AND LOGGED FOR SECURITY PURPOSES │
          <br />
          └─────────────────────────────────────────────────────────────────────────┘
        </div>
      </div>
    </div>
  );
}
