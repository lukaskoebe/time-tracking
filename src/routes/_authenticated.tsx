import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar, MobileNav } from '@/components/app-sidebar'
import { getSession } from '@/lib/auth.functions'
import { SyncProvider } from '@/lib/sync-context'

function getCachedUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('cached_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    let sessionUser: { id: string; name: string; email: string } | null = null

    try {
      const session = await getSession()
      if (session) {
        sessionUser = { id: session.user.id, name: session.user.name, email: session.user.email }
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_user', JSON.stringify(sessionUser))
        }
      }
    } catch {
      // Offline – fall back to cached session
      sessionUser = getCachedUser()
    }

    if (!sessionUser) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }

    return { user: sessionUser }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext()
  return (
    <SyncProvider userId={user.id}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <AppSidebar userName={user.name} userEmail={user.email} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <MobileNav userName={user.name} userEmail={user.email} />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SyncProvider>
  )
}
