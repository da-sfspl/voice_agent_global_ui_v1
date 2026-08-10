import { cn } from '@/lib/utils'

const campaigns = [
  {
    name: 'Q3 Renewal Outreach',
    agent: 'Payment Reminder Bot',
    progress: 68,
    contacted: 1360,
    total: 2000,
    status: 'running',
  },
  {
    name: 'New Product Launch',
    agent: 'Sales Qualifier',
    progress: 42,
    contacted: 840,
    total: 2000,
    status: 'running',
  },
  {
    name: 'Customer Satisfaction Survey',
    agent: 'Customer Support Bot',
    progress: 91,
    contacted: 1820,
    total: 2000,
    status: 'completing',
  },
]

const statusConfig: Record<string, string> = {
  running: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  completing: 'text-blue-700 bg-blue-50 border-blue-200',
  paused: 'text-amber-700 bg-amber-50 border-amber-200',
}

export function ActiveCampaignsWidget() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Active Campaigns</h3>
          <p className="text-xs text-muted-foreground">Currently running outbound campaigns</p>
        </div>
        <button className="text-xs text-primary hover:underline">View all</button>
      </div>
      <div className="space-y-4">
        {campaigns.map((c) => (
          <div key={c.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">{c.agent}</span>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize',
                  statusConfig[c.status]
                )}
              >
                {c.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {c.contacted.toLocaleString()} / {c.total.toLocaleString()}
              </span>
              <span className="shrink-0 text-[11px] font-medium text-foreground">{c.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
