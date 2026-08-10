import { cn } from '@/lib/utils'
import { PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react'

const calls = [
  {
    id: 'C-20419',
    caller: '+1 (415) 555-0192',
    agent: 'Customer Support Bot',
    direction: 'inbound',
    duration: '4m 32s',
    outcome: 'resolved',
    time: '2 min ago',
  },
  {
    id: 'C-20418',
    caller: '+1 (312) 555-0847',
    agent: 'Sales Qualifier',
    direction: 'outbound',
    duration: '7m 15s',
    outcome: 'transferred',
    time: '8 min ago',
  },
  {
    id: 'C-20417',
    caller: '+1 (646) 555-0334',
    agent: 'Appointment Scheduler',
    direction: 'inbound',
    duration: '2m 48s',
    outcome: 'resolved',
    time: '14 min ago',
  },
  {
    id: 'C-20416',
    caller: '+1 (213) 555-0721',
    agent: 'Customer Support Bot',
    direction: 'inbound',
    duration: '0m 22s',
    outcome: 'dropped',
    time: '19 min ago',
  },
  {
    id: 'C-20415',
    caller: '+1 (512) 555-0563',
    agent: 'Payment Reminder Bot',
    direction: 'outbound',
    duration: '3m 10s',
    outcome: 'resolved',
    time: '25 min ago',
  },
  {
    id: 'C-20414',
    caller: '+1 (404) 555-0298',
    agent: 'Sales Qualifier',
    direction: 'outbound',
    duration: '5m 44s',
    outcome: 'voicemail',
    time: '31 min ago',
  },
]

const outcomeConfig: Record<string, string> = {
  resolved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  transferred: 'text-blue-700 bg-blue-50 border-blue-200',
  dropped: 'text-red-700 bg-red-50 border-red-200',
  voicemail: 'text-amber-700 bg-amber-50 border-amber-200',
}

export function RecentCallsTable() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Calls</h3>
          <p className="text-xs text-muted-foreground">Last 30 minutes across all agents</p>
        </div>
        <button className="text-xs text-primary hover:underline">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Caller</th>
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Agent</th>
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Dir.</th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Duration</th>
              <th className="pb-2 text-center text-xs font-medium text-muted-foreground">Outcome</th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Time</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                <td className="py-2.5 text-xs font-mono text-muted-foreground">{call.id}</td>
                <td className="py-2.5 font-mono text-xs text-foreground">{call.caller}</td>
                <td className="py-2.5 text-xs text-foreground max-w-32 truncate">{call.agent}</td>
                <td className="py-2.5">
                  {call.direction === 'inbound' ? (
                    <PhoneIncoming className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <PhoneOutgoing className="h-3.5 w-3.5 text-blue-600" />
                  )}
                </td>
                <td className="py-2.5 text-right text-xs text-muted-foreground">{call.duration}</td>
                <td className="py-2.5 text-center">
                  <span
                    className={cn(
                      'inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize',
                      outcomeConfig[call.outcome]
                    )}
                  >
                    {call.outcome}
                  </span>
                </td>
                <td className="py-2.5 text-right text-xs text-muted-foreground whitespace-nowrap">{call.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
