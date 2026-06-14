import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/video-call',
      })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()

  const handleLogin = async () => {
    await auth.login()
    await navigate({ to: '/video-call' })
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <div className="space-y-4 rounded-4xl border border-border/70 bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Login Guard Demo
        </p>
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="leading-7 text-muted-foreground">
          This route uses <code>beforeLoad</code> to redirect authenticated users
          away from <code>/login</code> before the page renders.
        </p>
        <button
          type="button"
          onClick={handleLogin}
          className="rounded-full border border-border px-4 py-2"
        >
          Sign in as demo user
        </button>
      </div>
    </main>
  )
}
