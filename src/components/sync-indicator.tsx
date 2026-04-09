import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react'
import { useSyncContext } from '@/lib/sync-context'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SyncIndicator() {
  const { syncState, isOnline, pendingCount, triggerSync } = useSyncContext()

  const icon =
    !isOnline ? (
      <CloudOff className="h-4 w-4" />
    ) : syncState === 'syncing' ? (
      <RefreshCw className="h-4 w-4 animate-spin" />
    ) : syncState === 'error' ? (
      <AlertCircle className="h-4 w-4" />
    ) : (
      <Cloud className="h-4 w-4" />
    )

  const label =
    !isOnline
      ? `Offline${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
      : syncState === 'syncing'
        ? 'Syncing…'
        : syncState === 'error'
          ? 'Sync failed — tap to retry'
          : pendingCount > 0
            ? `${pendingCount} unsynced`
            : 'Synced'

  const color =
    !isOnline
      ? 'text-muted-foreground'
      : syncState === 'error'
        ? 'text-destructive'
        : pendingCount > 0
          ? 'text-amber-500'
          : 'text-muted-foreground/60'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => syncState !== 'syncing' && triggerSync()}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent',
            color,
          )}
          aria-label={label}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
