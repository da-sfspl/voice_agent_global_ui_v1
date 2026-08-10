'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  callsKpis, callVolumeTimeSeries, callOutcomes, callsByAgent,
  callsByCampaign, callsByProvider, callStatusDistribution, recentCallRecords,
} from '@/lib/analytics-data'
import {
  PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneOff, CheckCircle2,
  Clock, Zap, TrendingUp, RefreshCw, Download, Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

function fmt(n: number) { return n.toLocaleString() }
function pct(n: number) { return `${n.toFixed(1)}%` }
function fmtDur(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const outcomeColors: Record<string, string> = {
  resolved:          'text-emerald-700 bg-emerald-50 border-emerald-200',
  'demo-scheduled':  'text-blue-700 bg-blue-50 border-blue-200',
  voicemail:         'text-amber-700 bg-amber-50 border-amber-200',
  transferred:       'text-violet-700 bg-violet-50 border-violet-200',
  'no-answer':       'text-orange-700 bg-orange-50 border-orange-200',
  dropped:           'text-red-700 bg-red-50 border-red-200',
  failed:            'text-red-800 bg-red-100 border-red-300',
  'payment-arranged':'text-teal-700 bg-teal-50 border-teal-200',
}

const statusColors: Record<string, string> = {
  completed:   'text-emerald-700 bg-emerald-50 border-emerald-200',
  voicemail:   'text-amber-700 bg-amber-50 border-amber-200',
  dropped:     'text-red-700 bg-red-50 border-red-200',
  failed:      'text-red-800 bg-red-100 border-red-300',
  transferred: 'text-violet-700 bg-violet-50 border-violet-200',
  missed:      'text-orange-700 bg-orange-50 border-orange-200',
}

const maxVol = Math.max(...callVolumeTimeSeries.map(d => d.inbound + d.outbound))

export function CallsAnalytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [direction, setDirection] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')

  const kpis = [
    { label: 'Total Calls',         value: fmt(callsKpis.totalCalls),         icon: PhoneCall,     color: 'bg-primary/10 text-primary' },
    { label: 'Inbound',             value: fmt(callsKpis.inboundCalls),        icon: PhoneIncoming, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Outbound',            value: fmt(callsKpis.outboundCalls),       icon: PhoneOutgoing, color: 'bg-blue-100 text-blue-700' },
    { label: 'Answered',            value: fmt(callsKpis.answeredCalls),       icon: CheckCircle2,  color: 'bg-teal-100 text-teal-700' },
    { label: 'Missed / Failed',     value: fmt(callsKpis.missedFailed),        icon: PhoneOff,      color: 'bg-red-100 text-red-700' },
    { label: 'Avg Duration',        value: fmtDur(callsKpis.avgDurationSecs),  icon: Clock,         color: 'bg-sky-100 text-sky-700' },
    { label: 'Avg Response Latency',value: `${callsKpis.avgResponseLatencyMs}ms`, icon: Zap,        color: 'bg-amber-100 text-amber-700' },
    { label: 'Success Rate',        value: pct(callsKpis.successfulCallRate),  icon: TrendingUp,    color: 'bg-violet-100 text-violet-700' },
  ]

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Calls Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Operational call metrics — Acme Corp &middot; <span className="italic">Estimated data</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={dateRange} onValueChange={(v) => v && setDateRange(v)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={direction} onValueChange={(v) => v && setDirection(v)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All directions</SelectItem>
              <SelectItem value="inbound">Inbound only</SelectItem>
              <SelectItem value="outbound">Outbound only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={agentFilter} onValueChange={(v) => v && setAgentFilter(v)}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              <SelectItem value="agt-001">Customer Support Agent</SelectItem>
              <SelectItem value="agt-002">Sales Outreach Bot</SelectItem>
              <SelectItem value="agt-003">Appointment Scheduler</SelectItem>
              <SelectItem value="agt-004">Collections & Payment</SelectItem>
              <SelectItem value="agt-005">IT Help Desk</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', k.color)}>
                <k.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-2xl font-semibold tabular-nums">{k.value}</span>
          </div>
        ))}
      </div>

      {/* Call Volume Chart + Status Distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Volume over time */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Call Volume Over Time</h3>
              <p className="text-xs text-muted-foreground">Last 30 days · inbound vs outbound</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" />Inbound</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-chart-2" />Outbound</span>
            </div>
          </div>
          <div className="flex h-40 items-end gap-0.5 overflow-hidden">
            {callVolumeTimeSeries.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-0.5" style={{ height: '140px' }}>
                <div className="flex w-full items-end gap-px" style={{ height: '130px' }}>
                  <div className="flex-1 rounded-sm bg-primary/75 transition-all" style={{ height: `${((d.inbound) / maxVol) * 100}%` }} title={`Inbound: ${d.inbound}`} />
                  <div className="flex-1 rounded-sm bg-chart-2/75 transition-all" style={{ height: `${((d.outbound) / maxVol) * 100}%` }} title={`Outbound: ${d.outbound}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Jul 9</span><span>Jul 22</span><span>Aug 7</span>
          </div>
        </div>

        {/* Status distribution */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Call Status Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">By final call status</p>
          <div className="flex flex-col gap-2.5">
            {callStatusDistribution.map((s) => {
              const pctVal = (s.count / callsKpis.totalCalls) * 100
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{s.status}</span>
                    <span className="text-muted-foreground tabular-nums">{fmt(s.count)} ({pctVal.toFixed(1)}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={cn('h-full rounded-full', s.color)} style={{ width: `${pctVal}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Outcomes + By Provider */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Call Outcomes */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Call Outcomes / Dispositions</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution of final call outcomes</p>
          <div className="flex flex-col gap-2">
            {callOutcomes.map((o) => (
              <div key={o.outcome} className="flex items-center gap-3">
                <span className="w-36 text-xs text-foreground truncate">{o.outcome}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${o.pct}%` }} />
                </div>
                <span className="w-20 text-right text-xs text-muted-foreground tabular-nums">{fmt(o.count)} ({o.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Provider */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Calls by Provider</h3>
          <p className="text-xs text-muted-foreground mb-4">SIP / telephony provider distribution</p>
          <div className="flex flex-col gap-3">
            {callsByProvider.map((p) => (
              <div key={p.provider}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{p.provider}</span>
                  <span className="text-muted-foreground tabular-nums">{fmt(p.calls)} ({p.pct}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-chart-2/80" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-1">Calls by Campaign</h3>
            <p className="text-xs text-muted-foreground mb-3">Outbound campaign call volumes</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Campaign</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Calls</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Completed</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {callsByCampaign.map((c) => (
                    <tr key={c.campaign} className="border-b border-border/50 last:border-0">
                      <td className="py-2 text-foreground max-w-[160px] truncate">{c.campaign}</td>
                      <td className="py-2 text-right tabular-nums">{fmt(c.calls)}</td>
                      <td className="py-2 text-right tabular-nums text-emerald-700">{fmt(c.completed)}</td>
                      <td className="py-2 text-right tabular-nums text-destructive">{fmt(c.failed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Calls by Agent */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-1">Calls by Agent</h3>
        <p className="text-xs text-muted-foreground mb-4">Per-agent call volume and performance</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Agent</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Total Calls</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Answered</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Avg Duration</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {callsByAgent.map((a) => (
                <tr key={a.agent} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 text-sm font-medium">{a.agent}</td>
                  <td className="py-2.5 text-right text-xs tabular-nums">{fmt(a.calls)}</td>
                  <td className="py-2.5 text-right text-xs tabular-nums">{fmt(a.answered)}</td>
                  <td className="py-2.5 text-right text-xs tabular-nums">{a.avgDuration}</td>
                  <td className="py-2.5 text-right">
                    <span className={cn('text-xs font-medium', a.successRate >= 85 ? 'text-emerald-700' : a.successRate >= 70 ? 'text-amber-700' : 'text-destructive')}>
                      {pct(a.successRate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Call Records */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Recent Call Records</h3>
            <p className="text-xs text-muted-foreground">Drill-down into individual call records</p>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
            <Filter className="h-3 w-3" /> More filters
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['ID','Direction','Number','Agent','Campaign','Duration','Status','Outcome','Time'].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentCallRecords.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 text-xs font-mono text-muted-foreground pr-4">{r.id}</td>
                  <td className="py-2.5 pr-4">
                    {r.direction === 'inbound'
                      ? <PhoneIncoming className="h-3.5 w-3.5 text-emerald-600" />
                      : <PhoneOutgoing className="h-3.5 w-3.5 text-blue-600" />}
                  </td>
                  <td className="py-2.5 text-xs font-mono pr-4 whitespace-nowrap">{r.number}</td>
                  <td className="py-2.5 text-xs pr-4 max-w-[140px] truncate">{r.agent}</td>
                  <td className="py-2.5 text-xs pr-4 max-w-[140px] truncate text-muted-foreground">{r.campaign}</td>
                  <td className="py-2.5 text-xs tabular-nums pr-4">{r.duration}</td>
                  <td className="py-2.5 pr-4">
                    <span className={cn('inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize', statusColors[r.status] ?? 'text-muted-foreground bg-muted border-border')}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={cn('inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium', outcomeColors[r.outcome] ?? 'text-muted-foreground bg-muted border-border')}>
                      {r.outcome}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
