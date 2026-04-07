import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, FolderOpen, Clock } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AppSidebarProps {
  userName: string
  userEmail: string
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
]

export function AppSidebar({ userName, userEmail }: AppSidebarProps) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  function handleSignOut() {
    signOut().then(() => {
      window.location.href = '/login'
    })
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Clock className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-heading text-base font-semibold tracking-tight">
          TrackTime
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? currentPath === '/' : currentPath.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">{userName}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  )
}
