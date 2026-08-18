import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

const agents = [
  { name: 'Customer Support Bot', type: 'Inbound', status: 'active', calls: 48, successRate: 94 },
  { name: 'Sales Qualifier', type: 'Outbound', status: 'active', calls: 31, successRate: 87 },
  { name: 'Appointment Scheduler', type: 'Inbound', status: 'active', calls: 22, successRate: 96 },
  { name: 'Lead Follow-up Agent', type: 'Outbound', status: 'paused', calls: 0, successRate: 82 },
  { name: 'Payment Reminder Bot', type: 'Outbound', status: 'active', calls: 15, successRate: 91 },
  { name: 'Onboarding Assistant', type: 'Inbound', status: 'draft', calls: 0, successRate: 0 },
]

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground/50' },
}

export function AgentStatusWidget() {
  // Dynamically count agents per status (no hardcoded counts)
  const statusSummary = Object.entries(statusConfig)
    .map(([status, cfg]) => ({ status, cfg, count: agents.filter((a) => a.status === status).length }))
    .filter((s) => s.count > 0)

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Agent Status</h3>
          <p className="text-xs text-muted-foreground">Live overview of deployed agents</p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{agents.length} agents</span>
      </div>

      {/* Compact status summary */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-border/50 bg-muted/30 px-3 py-2">
        {statusSummary.map(({ status, cfg, count }) => (
          <span key={status} className="flex items-center gap-1.5 text-xs">
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            <span className="font-semibold tabular-nums text-foreground">{count}</span>
            <span className="text-muted-foreground">{cfg.label}</span>
          </span>
        ))}
      </div>

      {/* Agent list */}
      <div className="space-y-2">
        {agents.map((agent) => {
          const cfg = statusConfig[agent.status]
          const isActive = agent.status === 'active'
          return (
            <div
              key={agent.name}
              className="flex items-center gap-3 rounded-md border border-border/50 bg-background px-3 py-2.5"
            >
              {/* Icon */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              {/* Name + type */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">{agent.name}</span>
                <span className="text-[11px] text-muted-foreground">{agent.type}</span>
              </div>

              {/* Calls today (fixed width for alignment) */}
              <div className="hidden w-16 shrink-0 flex-col items-end sm:flex">
                {isActive ? (
                  <>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{agent.calls}</span>
                    <span className="text-[10px] text-muted-foreground">calls today</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Success rate (fixed width for alignment) */}
              <div className="w-12 shrink-0 text-right">
                {isActive ? (
                  <span className="text-xs font-semibold tabular-nums text-emerald-600">{agent.successRate}%</span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Status badge */}
              <span
                className={cn(
                  'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium',
                  cfg.className
                )}
              >
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}