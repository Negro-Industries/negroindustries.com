'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AgentMonitorCardProps {
  agentName: string;
  taskDescription: string;
  progress: number;
  eta: string;
  status: 'active' | 'idle' | 'error' | 'complete';
  className?: string;
}

export function AgentMonitorCard({
  agentName,
  taskDescription,
  progress,
  eta,
  status,
  className,
}: AgentMonitorCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'neon-cyan';
      case 'idle':
        return 'neon-amber';
      case 'error':
        return 'neon-red';
      case 'complete':
        return 'neon-green';
      default:
        return 'neon-green';
    }
  };

  const getStatusSymbol = () => {
    switch (status) {
      case 'active':
        return '↳';
      case 'idle':
        return '⏸';
      case 'error':
        return '✗';
      case 'complete':
        return '✓';
      default:
        return '●';
    }
  };

  return (
    <Card
      className={cn(
        'crt-screen terminal-box-double bg-black border-2',
        className
      )}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between font-mono text-sm uppercase tracking-wider'>
          <div className='flex items-center gap-2'>
            <span className={cn('text-lg', getStatusColor())}>
              {getStatusSymbol()}
            </span>
            <span className='neon-text'>
              AGENT &apos;{agentName.toUpperCase()}&apos;
            </span>
          </div>
          <div className='text-xs opacity-75'>
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Task Description */}
        <div className='space-y-2'>
          <div className='text-xs uppercase tracking-wide text-muted-foreground'>
            ┌─ CURRENT OPERATION
          </div>
          <div className='pl-4 text-sm font-mono'>
            <span className='terminal-prompt'></span>
            <span
              className={cn(
                'glitch',
                status === 'active' ? 'neon-cyan' : 'neon-green'
              )}
              data-text={taskDescription}
            >
              {taskDescription}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='space-y-2'>
          <div className='flex justify-between text-xs uppercase tracking-wide text-muted-foreground'>
            <span>├─ PROGRESS</span>
            <span>{progress}%</span>
          </div>
          <div className='relative'>
            <Progress
              value={progress}
              className='h-3 bg-secondary border border-border'
            />
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-xs font-mono font-bold text-black mix-blend-difference'>
                {'█'.repeat(Math.floor(progress / 10))}
                {'░'.repeat(10 - Math.floor(progress / 10))}
              </div>
            </div>
          </div>
        </div>

        {/* ETA */}
        <div className='space-y-2'>
          <div className='text-xs uppercase tracking-wide text-muted-foreground'>
            └─ ETA
          </div>
          <div className='pl-4 text-sm font-mono'>
            <span className={cn('neon-text', getStatusColor())}>{eta}</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className='flex items-center justify-between pt-2 border-t border-border'>
          <div className='text-xs uppercase tracking-wide text-muted-foreground'>
            STATUS
          </div>
          <div
            className={cn(
              'text-xs font-mono uppercase font-bold',
              getStatusColor()
            )}
          >
            {status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
