import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  subtext?: string
}

export function StatCard({ label, value, delta, deltaType = 'neutral', icon: Icon, iconColor, subtext }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', iconColor ?? 'bg-muted')}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold tracking-tight text-foreground">{value}</span>
        {delta && (
          <span
            className={cn(
              'text-xs font-medium',
              deltaType === 'up' && 'text-emerald-600',
              deltaType === 'down' && 'text-destructive',
              deltaType === 'neutral' && 'text-muted-foreground'
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  )
}
