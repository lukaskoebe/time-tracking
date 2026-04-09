import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, FolderOpen, Clock, Menu } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { FloralDecoration } from '@/components/floral-decoration'
import { SyncIndicator } from '@/components/sync-indicator'
import { useState } from 'react'

interface SidebarProps {
  userName: string
  userEmail: string
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
]

function SidebarContent({
  userName,
  userEmail,
  onNav,
}: SidebarProps & { onNav?: () => void }) {
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
    <div className="flex h-full flex-col">
      {/* Logo + floral header */}
      <div className="relative overflow-hidden px-4 pb-2 pt-5">
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Clock className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-base font-bold tracking-tight">
            TrackTime
          </span>
        </div>
        {/* Floral decoration tucked in corner */}
        <FloralDecoration
          variant="small"
          className="absolute -right-1 -top-1 h-12 w-32 opacity-70"
        />
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 mt-1 h-px bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === '/' ? currentPath === '/' : currentPath.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              onClick={onNav}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/12 text-primary'
                  : 'text-sidebar-foreground/80 hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sync status */}
      <div className="px-3 pb-1">
        <SyncIndicator />
      </div>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-none">
              {userName}
            </p>
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
    </div>
  )
}

export function AppSidebar({ userName, userEmail }: SidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <SidebarContent userName={userName} userEmail={userEmail} />
    </aside>
  )
}

export function MobileNav({ userName, userEmail }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex items-center gap-3 border-b border-border bg-sidebar px-4 py-3 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent
            userName={userName}
            userEmail={userEmail}
            onNav={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
          <Clock className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-heading text-sm font-bold">TrackTime</span>
      </div>
    </header>
  )
}
