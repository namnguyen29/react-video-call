import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { AuthState } from '@/lib/auth'

import '../styles.css'

type RouterContext = {
  auth: AuthState
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const { auth } = Route.useRouteContext()

  return (
    <>
      <div className="border-b border-border/70 bg-background/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="font-semibold">
              Home
            </Link>
            <Link to="/video-call">Video call</Link>
            <Link to="/login">Login</Link>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {auth.isAuthenticated ? `Signed in as ${auth.user?.name}` : 'Signed out'}
            </span>
            {auth.isAuthenticated ? (
              <button
                type="button"
                onClick={auth.logout}
                className="rounded-full border border-border px-3 py-1.5"
              >
                Log out
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
