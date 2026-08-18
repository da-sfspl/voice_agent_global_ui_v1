import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Bot } from 'lucide-react'

const agents = [
  { name: 'Customer Support Bot', type: 'Inbound', status: 'active', calls: 48, successRate: 94 },
  { name: 'Sales Qualifier', type: 'Outbound', status: 'active', calls: 31, successRate: 87 },
  { name: 'Appointment Scheduler', type: 'Inbound', status: 'active', calls: 22, successRate: 96 },
  { name: 'Lead Follow-up Agent', type: 'Outbound', status: 'paused', calls: 0, successRate: 82 },
  { name: 'Payment Reminder Bot', type: 'Outbound', status: 'active', calls: 15, successRate: 91 },
  { name: 'Onboarding Assistant', type: 'Inbound', status: 'draft', calls: 0, successRate: 0 },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused: { label: 'Paused', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-border' },
}

export function AgentStatusWidget() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Agent Status</h3>
          <p className="text-xs text-muted-foreground">Live overview of deployed agents</p>
        </div>
        <span className="text-xs text-muted-foreground">6 agents</span>
      </div>
      <div className="space-y-2">
        {agents.map((agent) => {
          const cfg = statusConfig[agent.status]
          return (
            <div
              key={agent.name}
              className="flex items-center gap-3 rounded-md border border-border/50 bg-background px-3 py-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">{agent.name}</span>
                <span className="text-[11px] text-muted-foreground">{agent.type}</span>
              </div>
              <div className="hidden shrink-0 flex-col items-end sm:flex">
                {agent.status === 'active' ? (
                  <>
                    <span className="text-sm font-medium text-foreground">{agent.calls}</span>
                    <span className="text-[10px] text-muted-foreground">calls today</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
              <div className="shrink-0 ml-2">
                {agent.status === 'active' ? (
                  <span className="text-xs font-medium text-emerald-600">{agent.successRate}%</span>
                ) : null}
              </div>
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
