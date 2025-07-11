'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
}

interface TerminalLogFeedProps {
  logs: LogEntry[];
  className?: string;
  autoScroll?: boolean;
}

export function TerminalLogFeed({
  logs,
  className,
  autoScroll = true,
}: TerminalLogFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  useEffect(() => {
    if (autoScroll && isScrolledToBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isScrolledToBottom]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return 'neon-cyan';
      case 'warning':
        return 'neon-amber';
      case 'error':
        return 'neon-red';
      case 'success':
        return 'neon-green';
      case 'system':
        return 'neon-magenta';
      default:
        return 'neon-green';
    }
  };

  const getLogSymbol = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return '●';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      case 'success':
        return '✓';
      case 'system':
        return '◆';
      default:
        return '●';
    }
  };

  return (
    <Card
      className={cn('crt-screen terminal-box bg-black border-2', className)}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='font-mono text-sm uppercase tracking-wider neon-text'>
          ┌─────────────────────────────────────┐ │ ACTIVITY MONITOR │
          └─────────────────────────────────────┘
        </CardTitle>
        <div className='text-xs font-mono text-muted-foreground'>
          CHANNEL: #negro-industries-ops | USERS: 12 | TOPIC: Real-time agent
          monitoring
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className='h-96 overflow-y-auto bg-black border border-border p-4 space-y-1'
        >
          {logs.map(log => (
            <div
              key={log.id}
              className='flex items-start gap-2 font-mono text-xs hover:bg-secondary/10 p-1 rounded'
            >
              {/* Timestamp */}
              <span className='text-muted-foreground shrink-0'>
                [{log.timestamp}]
              </span>

              {/* Status Symbol */}
              <span className={cn('shrink-0', getLogColor(log.type))}>
                {getLogSymbol(log.type)}
              </span>

              {/* Agent Name */}
              <span className={cn('shrink-0 font-bold', getLogColor(log.type))}>
                &lt;{log.agent}&gt;
              </span>

              {/* Message */}
              <span className='text-foreground break-words'>{log.message}</span>
            </div>
          ))}

          {/* Cursor */}
          <div className='flex items-center gap-2 font-mono text-xs'>
            <span className='text-muted-foreground'>
              [{new Date().toLocaleTimeString('en-US', { hour12: false })}]
            </span>
            <span className='neon-green'>●</span>
            <span className='neon-green font-bold'>&lt;SYSTEM&gt;</span>
            <span className='text-foreground'>
              <span className='terminal-prompt'></span>
              <span className='neon-green animate-pulse'>█</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-border'>
          <div className='flex justify-between items-center text-xs font-mono text-muted-foreground'>
            <div>
              LINES: {logs.length} | SCROLL:{' '}
              {isScrolledToBottom ? 'BOTTOM' : 'MANUAL'}
            </div>
            <div className='flex gap-4'>
              <span>F5: REFRESH</span>
              <span>F9: CLEAR</span>
              <span>F12: EXPORT</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
