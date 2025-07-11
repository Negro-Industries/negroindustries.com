import Link from 'next/link';

export default function HomePage() {
  return (
    <div className='min-h-screen bg-black crt-screen flex items-center justify-center p-4'>
      <div className='text-center space-y-8'>
        {/* ASCII Art Logo */}
        <div className='mb-8'>
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
        </div>

        {/* Welcome Message */}
        <div className='space-y-4'>
          <h1 className='text-2xl font-mono uppercase tracking-wider neon-cyan'>
            WELCOME TO THE MATRIX
          </h1>
          <p className='text-sm font-mono text-muted-foreground max-w-md mx-auto'>
            UNDERGROUND HACKING COLLECTIVE • EST. 1998
            <br />
            PHREAKING THE MATRIX SINCE Y2K
          </p>
        </div>

        {/* Terminal Access */}
        <div className='space-y-4'>
          <div className='text-xs font-mono text-muted-foreground'>
            ┌─────────────────────────────────────┐
            <br />
            │ SECURE TERMINAL ACCESS │
            <br />
            └─────────────────────────────────────┘
          </div>

          <div className='space-y-2'>
            <div className='text-xs font-mono text-muted-foreground'>
              <span className='terminal-prompt'></span>
              <span className='neon-green'>INITIALIZING CONNECTION...</span>
            </div>
            <div className='text-xs font-mono text-muted-foreground'>
              <span className='terminal-prompt'></span>
              <span className='neon-cyan'>AUTHENTICATING USER...</span>
            </div>
            <div className='text-xs font-mono text-muted-foreground'>
              <span className='terminal-prompt'></span>
              <span className='neon-amber'>
                ESTABLISHING ENCRYPTED TUNNEL...
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Link */}
        <div className='pt-8'>
          <Link
            href='/dashboard'
            className='inline-block bg-black border-2 border-primary px-8 py-4 font-mono text-sm uppercase tracking-wider neon-cyan hover:bg-primary/10 transition-all duration-200 hover:scale-105'
          >
            [ENTER] ACCESS DASHBOARD
          </Link>
        </div>

        {/* Warning */}
        <div className='pt-8'>
          <div className='text-xs font-mono text-muted-foreground'>
            ┌─────────────────────────────────────────────────────────────────────────┐
            <br />
            │ WARNING: UNAUTHORIZED ACCESS IS PROHIBITED BY FEDERAL LAW │
            <br />
            │ ALL ACTIVITIES ARE MONITORED AND LOGGED FOR SECURITY PURPOSES │
            <br />
            └─────────────────────────────────────────────────────────────────────────┘
          </div>
        </div>
      </div>
    </div>
  );
}
