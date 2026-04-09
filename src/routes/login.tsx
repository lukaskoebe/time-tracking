import { useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Clock } from 'lucide-react'
import { getSession } from '@/lib/auth.functions'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FloralDecoration } from '@/components/floral-decoration'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    try {
      const session = await getSession()
      if (session) throw redirect({ to: '/' })
    } catch (e) {
      // Re-throw redirects (user already logged in), swallow auth/network errors
      if (e instanceof Error && '_isRedirect' in e) throw e
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await signIn.email({ email, password })
    if (result.error) {
      toast.error(result.error.message ?? 'Sign in failed')
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Corner floral decorations */}
      <FloralDecoration
        variant="corner"
        className="pointer-events-none absolute left-0 top-0 h-32 w-32 -translate-x-4 -translate-y-4 opacity-60"
      />
      <FloralDecoration
        variant="corner"
        className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 translate-x-4 translate-y-4 rotate-180 opacity-60"
      />

      <div className="relative w-full max-w-sm space-y-7">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Clock className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              TrackTime
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
