import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '@/components/app-sidebar'
import { getSession } from '@/lib/auth.functions'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    return { user: session.user }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext()
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar userName={user.name} userEmail={user.email} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
