'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ActionPanelProps {
  onCancel?: () => void;
  onPause?: () => void;
  onClose?: () => void;
  onRestart?: () => void;
  className?: string;
}

export function ActionPanel({
  onCancel,
  onPause,
  onClose,
  onRestart,
  className,
}: ActionPanelProps) {
  const actions = [
    {
      id: 1,
      label: 'CANCEL',
      action: onCancel,
      color: 'neon-red',
      hotkey: 'C',
    },
    {
      id: 2,
      label: 'PAUSE',
      action: onPause,
      color: 'neon-amber',
      hotkey: 'P',
    },
    {
      id: 3,
      label: 'RESTART',
      action: onRestart,
      color: 'neon-cyan',
      hotkey: 'R',
    },
    {
      id: 4,
      label: 'CLOSE WINDOW',
      action: onClose,
      color: 'neon-magenta',
      hotkey: 'X',
    },
  ];

  return (
    <Card
      className={cn('crt-screen terminal-box bg-black border-2', className)}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='font-mono text-sm uppercase tracking-wider neon-text text-center'>
          ┌─────────────────────────────────────┐ │ COMMAND CONSOLE │
          └─────────────────────────────────────┘
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Menu Options */}
        <div className='space-y-3'>
          {actions.map(action => (
            <Button
              key={action.id}
              onClick={action.action}
              variant='outline'
              className={cn(
                'w-full justify-start font-mono text-sm uppercase tracking-wider',
                'border-2 bg-black hover:bg-secondary/20',
                'transition-all duration-200 hover:scale-105',
                'focus:ring-2 focus:ring-offset-2 focus:ring-offset-black'
              )}
            >
              <div className='flex items-center justify-between w-full'>
                <div className='flex items-center gap-3'>
                  <span className={cn('font-bold text-lg', action.color)}>
                    [{action.id}]
                  </span>
                  <span className='neon-text'>{action.label}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    CTRL+{action.hotkey}
                  </span>
                  <span className={cn('text-lg', action.color)}>►</span>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* System Info */}
        <div className='pt-4 border-t border-border space-y-2'>
          <div className='text-xs font-mono text-center text-muted-foreground'>
            ┌─ SYSTEM COMMANDS ─┐
            <br />
            │ ESC: EXIT MENU │
            <br />
            │ F1: HELP │
            <br />
            │ F10: SHUTDOWN │
            <br />
            └───────────────────┘
          </div>
        </div>

        {/* Warning */}
        <div className='bg-secondary/20 border border-destructive/50 p-3 rounded'>
          <div className='text-xs font-mono text-center'>
            <span className='neon-red'>⚠ WARNING ⚠</span>
            <br />
            <span className='text-muted-foreground'>
              UNAUTHORIZED ACCESS DETECTED
              <br />
              LOGGING ALL ACTIVITIES
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className='text-xs font-mono text-center text-muted-foreground'>
          <div className='terminal-prompt'></div>
          <span className='neon-green'>AWAITING INPUT...</span>
        </div>
      </CardContent>
    </Card>
  );
}
