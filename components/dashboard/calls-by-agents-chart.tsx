'use client'

import { useState } from 'react'
import { Bot } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type RangeKey = '7d' | '30d' | '90d'

type AgentCalls = {
  name: string
  calls: number
  resolutionRate?: number
}

const RANGES: Record<RangeKey, { label: string }> = {
  '7d': { label: 'Last 7 days' },
  '30d': { label: 'Last 30 days' },
  '90d': { label: 'Last 90 days' },
}

// Local dummy data per time range (organization-level)
const callsByAgentData: Record<RangeKey, AgentCalls[]> = {
  '7d': [
    { name: 'Customer Support Agent', calls: 482, resolutionRate: 91 },
    { name: 'Sales Outreach Bot', calls: 356, resolutionRate: 74 },
    { name: 'Appointment Scheduler', calls: 289, resolutionRate: 95 },
    { name: 'Collections & Payment', calls: 174, resolutionRate: 68 },
    { name: 'Onboarding Assistant', calls: 96, resolutionRate: 88 },
  ],
  '30d': [
    { name: 'Customer Support Agent', calls: 2140, resolutionRate: 90 },
    { name: 'Sales Outreach Bot', calls: 1580, resolutionRate: 73 },
    { name: 'Appointment Scheduler', calls: 1265, resolutionRate: 94 },
    { name: 'Collections & Payment', calls: 840, resolutionRate: 67 },
    { name: 'Onboarding Assistant', calls: 415, resolutionRate: 87 },
  ],
  '90d': [
    { name: 'Customer Support Agent', calls: 6320, resolutionRate: 89 },
    { name: 'Sales Outreach Bot', calls: 4710, resolutionRate: 72 },
    { name: 'Appointment Scheduler', calls: 3890, resolutionRate: 93 },
    { name: 'Collections & Payment', calls: 2530, resolutionRate: 66 },
    { name: 'Onboarding Assistant', calls: 1240, resolutionRate: 86 },
  ],
}

export function CallsByAgentChart() {
  const [range, setRange] = useState<RangeKey>('30d')

  const sorted = [...callsByAgentData[range]].sort((a, b) => b.calls - a.calls)
  const maxCalls = sorted.length ? sorted[0].calls : 0

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Calls by Agent</h3>
          <p className="text-xs text-muted-foreground">
            Call workload by AI agent · {RANGES[range].label}
          </p>
        </div>
        <Select value={range} onValueChange={(v) => v && setRange(v as RangeKey)}>
          <SelectTrigger className="h-7 w-[118px] shrink-0 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bars / empty state */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Bot className="h-6 w-6 text-muted-foreground/60" />
          <p className="text-xs text-muted-foreground">No agent call records for this period</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sorted.map((agent) => {
            const pct = maxCalls > 0 ? (agent.calls / maxCalls) * 100 : 0
            return (
              <div key={agent.name}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-foreground">{agent.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {agent.resolutionRate != null && (
                      <span className="text-[10px] text-muted-foreground">
                        {agent.resolutionRate}% resolved
                      </span>
                    )}
                    <span className="font-semibold tabular-nums text-foreground">
                      {agent.calls.toLocaleString()}
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/80 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}