import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-4 rounded-4xl border border-border/70 bg-card p-8 shadow-sm">
        <h1 className="text-4xl font-bold">Welcome to TanStack Router</h1>
        <p className="text-base leading-7 text-muted-foreground">
          Use the login route to test a simple auth guard. Once signed in,
          visiting <code>/login</code> redirects to the video call screen.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-full border border-border px-4 py-2"
          >
            Open login route
          </Link>
          <Link
            to="/video-call"
            className="rounded-full border border-border px-4 py-2"
          >
            Open video call
          </Link>
        </div>
      </div>
    </main>
  )
}
