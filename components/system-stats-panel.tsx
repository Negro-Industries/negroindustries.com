'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SystemStatsProps {
  transferSpeed: string;
  activeTasks: number;
  completedTasks: number;
  totalTasks: number;
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  className?: string;
}

export function SystemStatsPanel({
  transferSpeed,
  activeTasks,
  completedTasks,
  totalTasks,
  uptime,
  cpuUsage,
  memoryUsage,
  className,
}: SystemStatsProps) {
  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'neon-green';
    if (usage < 80) return 'neon-amber';
    return 'neon-red';
  };

  const formatBar = (value: number, max: number = 100) => {
    const filled = Math.floor((value / max) * 20);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  return (
    <Card
      className={cn('crt-screen ascii-border bg-black border-2', className)}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='font-mono text-sm uppercase tracking-wider neon-text'>
          ┌─────────────────────────────────────┐ │ SYSTEM DIAGNOSTICS │
          └─────────────────────────────────────┘
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 font-mono text-sm'>
        {/* Transfer Speed */}
        <div className='space-y-1'>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>TRANSFER SPD:</span>
            <span className='neon-cyan font-bold'>{transferSpeed}</span>
          </div>
          <div className='text-xs text-muted-foreground'>
            ├─ BANDWIDTH UTILIZATION: HIGH
          </div>
        </div>

        {/* Task Statistics */}
        <div className='space-y-2'>
          <div className='text-xs uppercase tracking-wide text-muted-foreground border-b border-border pb-1'>
            TASK QUEUE STATUS
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>ACTIVE:</span>
                <span className='neon-cyan font-bold'>{activeTasks}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>DONE:</span>
                <span className='neon-green font-bold'>{completedTasks}</span>
              </div>
            </div>

            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>TOTAL:</span>
                <span className='neon-amber font-bold'>{totalTasks}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>QUEUE:</span>
                <span className='neon-magenta font-bold'>
                  {totalTasks - completedTasks - activeTasks}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='space-y-1'>
            <div className='text-xs text-muted-foreground'>
              COMPLETION: {Math.round((completedTasks / totalTasks) * 100)}%
            </div>
            <div className='bg-secondary p-1 border border-border'>
              <div className='text-xs font-mono'>
                <span className='neon-green'>
                  {formatBar(completedTasks, totalTasks)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Resources */}
        <div className='space-y-2'>
          <div className='text-xs uppercase tracking-wide text-muted-foreground border-b border-border pb-1'>
            RESOURCE MONITOR
          </div>

          {/* CPU Usage */}
          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>CPU:</span>
              <span className={cn('font-bold', getUsageColor(cpuUsage))}>
                {cpuUsage}%
              </span>
            </div>
            <div className='bg-secondary p-1 border border-border'>
              <div className='text-xs font-mono'>
                <span className={getUsageColor(cpuUsage)}>
                  {formatBar(cpuUsage)}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>MEM:</span>
              <span className={cn('font-bold', getUsageColor(memoryUsage))}>
                {memoryUsage}%
              </span>
            </div>
            <div className='bg-secondary p-1 border border-border'>
              <div className='text-xs font-mono'>
                <span className={getUsageColor(memoryUsage)}>
                  {formatBar(memoryUsage)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className='space-y-1'>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>UPTIME:</span>
            <span className='neon-green font-bold'>{uptime}</span>
          </div>
          <div className='text-xs text-muted-foreground'>
            └─ SYSTEM STABLE • NO ERRORS DETECTED
          </div>
        </div>

        {/* Footer */}
        <div className='pt-2 border-t border-border'>
          <div className='text-xs text-center text-muted-foreground'>
            ┌─ NEGRO INDUSTRIES MONITORING SYSTEM ─┐
            <br />
            │ ALL SYSTEMS NOMINAL • STANDBY MODE │
            <br />
            └─────────────────────────────────────┘
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
