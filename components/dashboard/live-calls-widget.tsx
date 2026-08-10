'use client'

import { cn } from '@/lib/utils'
import { PhoneIncoming, PhoneOutgoing } from 'lucide-react'

const liveCalls = [
  {
    id: 'L-001',
    caller: '+1 (415) 555-0192',
    agent: 'Customer Support Bot',
    direction: 'inbound',
    duration: '02:14',
    sentiment: 'positive',
  },
  {
    id: 'L-002',
    caller: '+1 (312) 555-0847',
    agent: 'Sales Qualifier',
    direction: 'outbound',
    duration: '05:42',
    sentiment: 'neutral',
  },
  {
    id: 'L-003',
    caller: '+1 (646) 555-0334',
    agent: 'Appointment Scheduler',
    direction: 'inbound',
    duration: '01:07',
    sentiment: 'positive',
  },
]

const sentimentConfig: Record<string, string> = {
  positive: 'text-emerald-600',
  neutral: 'text-muted-foreground',
  negative: 'text-destructive',
}

export function LiveCallsWidget() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Live Calls</h3>
          <p className="text-xs text-muted-foreground">Active calls right now</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-600">{liveCalls.length} active</span>
        </div>
      </div>
      <div className="space-y-2">
        {liveCalls.map((call) => (
          <div
            key={call.id}
            className="flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5"
          >
            <div className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              call.direction === 'inbound' ? 'bg-emerald-50' : 'bg-blue-50'
            )}>
              {call.direction === 'inbound' ? (
                <PhoneIncoming className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <PhoneOutgoing className="h-3.5 w-3.5 text-blue-600" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs font-mono text-foreground">{call.caller}</span>
              <span className="text-[11px] text-muted-foreground truncate">{call.agent}</span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span className="font-mono text-xs text-foreground">{call.duration}</span>
              <span className={cn('text-[10px] font-medium capitalize', sentimentConfig[call.sentiment])}>
                {call.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
