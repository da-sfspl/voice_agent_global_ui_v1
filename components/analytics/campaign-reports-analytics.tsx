'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  campaignKpis, campaignReports, campaignDailyVolume,
} from '@/lib/analytics-data'
import {
  Megaphone, Users, PhoneCall, CheckCircle2, XCircle,
  TrendingUp, Clock, RefreshCw, Download, ChevronDown, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Fragment } from 'react'

function fmt(n: number) { return n.toLocaleString() }
function pct(n: number) { return `${n.toFixed(1)}%` }

const statusConfig: Record<string, { label: string; className: string }> = {
  running:   { label: 'Running',   className: 'border-[var(--status-active)]/30 text-[var(--status-active)]' },
  scheduled: { label: 'Scheduled', className: 'border-blue-500/30 text-blue-500' },
  paused:    { label: 'Paused',    className: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]' },
  completed: { label: 'Completed', className: 'border-primary/30 text-primary' },
  draft:     { label: 'Draft',     className: 'border-border text-muted-foreground' },
}

export function CampaignReportsAnalytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null) 

  const rangeDays = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30
  const chartData = campaignDailyVolume.slice(-rangeDays)
  const maxTotal = Math.max(...chartData.map(d => d.cmp001 + d.cmp002 + d.cmp006), 1)

  // ── Evenly-spaced x-axis label indices (always include first & last) ────
  const labelIdxs = (() => {
    const n = chartData.length
    const count = Math.min(5, n)
    const s = new Set<number>()
    for (let k = 0; k < count; k++) s.add(Math.round((k / Math.max(1, count - 1)) * (n - 1)))
    return Array.from(s).sort((a, b) => a - b)
  })()

  const filtered = campaignReports.filter(c =>
    statusFilter === 'all' || c.status === statusFilter
  )

  const kpis = [
    { label: 'Total Campaigns',  value: campaignKpis.totalCampaigns,                    icon: Megaphone,    color: 'bg-primary/10 text-primary' },
    { label: 'Active',           value: campaignKpis.activeCampaigns,                   icon: Megaphone,    color: 'bg-[var(--status-active)]/10 text-[var(--status-active)]' },
    { label: 'Total Contacts',   value: fmt(campaignKpis.totalContacts),                icon: Users,        color: 'bg-blue-100 text-blue-700' },
    { label: 'Calls Attempted',  value: fmt(campaignKpis.callsAttempted),               icon: PhoneCall,    color: 'bg-sky-100 text-sky-700' },
    { label: 'Calls Completed',  value: fmt(campaignKpis.callsCompleted),               icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Calls Failed',     value: fmt(campaignKpis.callsFailed),                  icon: XCircle,      color: 'bg-red-100 text-red-700' },
    { label: 'Contact Rate',     value: pct(campaignKpis.contactRate),                  icon: TrendingUp,   color: 'bg-violet-100 text-violet-700' },
    { label: 'Avg Call Duration',value: campaignKpis.avgCallDuration,                   icon: Clock,        color: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campaign Reports</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Campaign-level performance and reporting — <span className="italic">Estimated data</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={dateRange} onValueChange={(v) => v && setDateRange(v)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
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

      {/* Daily Volume Chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Campaign Call Volume Over Time</h3>
            <p className="text-xs text-muted-foreground">Daily calls dispatched across active campaigns</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" />Q3 Sales</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-chart-2" />Collections</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-chart-3" />Win-Back</span>
          </div>
        </div>

        <div className="relative">
          {/* Stacked bars */}
          <div className="flex h-40 gap-[2px]" onMouseLeave={() => setHoverIdx(null)}>
            {chartData.map((d, i) => {
              const total = d.cmp001 + d.cmp002 + d.cmp006
              const segH = (v: number) => (total > 0 ? `${(v / total) * 100}%` : '0%')
              return (
                <div
                  key={d.day}
                  onMouseEnter={() => setHoverIdx(i)}
                  className={cn(
                    'flex flex-1 flex-col justify-end rounded-sm transition-colors',
                    hoverIdx === i && 'bg-muted/60'
                  )}
                >
                  <div
                    className="flex w-full flex-col-reverse overflow-hidden rounded-t-[3px]"
                    style={{ height: `${(total / maxTotal) * 100}%` }}
                  >
                    <div className="w-full bg-primary" style={{ height: segH(d.cmp001) }} />
                    <div className="w-full bg-chart-2" style={{ height: segH(d.cmp002) }} />
                    <div className="w-full bg-chart-3" style={{ height: segH(d.cmp006) }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hover tooltip */}
          {hoverIdx !== null && chartData[hoverIdx] && (() => {
            const d = chartData[hoverIdx]
            const total = d.cmp001 + d.cmp002 + d.cmp006
            return (
              <div
                className="pointer-events-none absolute top-1 z-10 w-44 rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md"
                style={{
                  left: `${((hoverIdx + 0.5) / chartData.length) * 100}%`,
                  transform: hoverIdx > chartData.length / 2 ? 'translateX(-105%)' : 'translateX(8px)',
                }}
              >
                <p className="mb-1.5 font-semibold">{d.day}</p>
                <div className="space-y-1 tabular-nums">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{fmt(total)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-primary" />Q3 Sales</span>
                    <span>{fmt(d.cmp001)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-chart-2" />Collections</span>
                    <span>{fmt(d.cmp002)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-chart-3" />Win-Back</span>
                    <span>{fmt(d.cmp006)}</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* X-axis labels (reduced density, aligned to bars) */}
        <div className="mt-1.5 flex gap-[2px] text-[10px] text-muted-foreground">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 truncate text-center">
              {labelIdxs.includes(i) ? d.day : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Report Table */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-1">Campaign Performance Report</h3>
        <p className="text-xs text-muted-foreground mb-4">Select a campaign to view detailed summary</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['','Campaign','Status','Agent','Contacts','Attempted','Completed','Failed','Contact Rate','Success Rate','Progress','Avg Duration'].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-medium text-muted-foreground pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sc = statusConfig[c.status]
                const isSelected = selectedCampaign === c.id
                return (
                  <Fragment key={c.id}> 
                    <tr
                      className={cn('border-b border-border/50 last:border-0 cursor-pointer transition-colors', isSelected ? 'bg-muted/60' : 'hover:bg-muted/40')}
                      onClick={() => setSelectedCampaign(isSelected ? null : c.id)}
                    >
                      <td className="py-2.5 pr-2">
                        {isSelected ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      </td>
                      <td className="py-2.5 text-sm font-medium pr-4 max-w-[180px] truncate">{c.name}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="outline" className={cn('text-[10px]', sc.className)}>{sc.label}</Badge>
                      </td>
                      <td className="py-2.5 text-xs pr-4 text-muted-foreground max-w-[140px] truncate">{c.agent}</td>
                      <td className="py-2.5 text-xs tabular-nums pr-4">{fmt(c.totalContacts)}</td>
                      <td className="py-2.5 text-xs tabular-nums pr-4">{fmt(c.attempted)}</td>
                      <td className="py-2.5 text-xs tabular-nums pr-4 text-emerald-700">{fmt(c.completed)}</td>
                      <td className="py-2.5 text-xs tabular-nums pr-4 text-destructive">{fmt(c.failed)}</td>
                      <td className="py-2.5 text-xs tabular-nums pr-4">{c.contactRate > 0 ? pct(c.contactRate) : '—'}</td>
                      <td className="py-2.5 pr-4">
                        <span className={cn('text-xs font-medium', c.successRate >= 70 ? 'text-emerald-700' : c.successRate > 0 ? 'text-amber-700' : 'text-muted-foreground')}>
                          {c.successRate > 0 ? pct(c.successRate) : '—'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 w-28">
                        <div className="flex items-center gap-2">
                          <Progress value={c.progress} className="h-1.5 flex-1" />
                          <span className="text-[10px] text-muted-foreground tabular-nums w-8">{c.progress}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-xs tabular-nums text-muted-foreground">{c.avgDuration}</td>
                    </tr>
                    {isSelected && (
                      <tr key={`${c.id}-detail`} className="border-b border-border/50 bg-muted/30">
                        <td colSpan={12} className="px-4 py-4">
                          <CampaignDetailPanel campaign={c} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CampaignDetailPanel({ campaign: c }: { campaign: typeof campaignReports[0] }) {
  const sc = statusConfig[c.status]
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{c.name}</span>
        <Badge variant="outline" className={cn('text-[10px]', sc.className)}>{sc.label}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Agent',         value: c.agent },
          { label: 'Date Range',    value: `${c.startDate} → ${c.endDate}` },
          { label: 'Top Outcome',   value: c.topOutcome },
          { label: 'Avg Duration',  value: c.avgDuration },
        ].map(s => (
          <div key={s.label} className="rounded-md border border-border bg-card p-3">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-sm font-medium">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {[
          { label: 'Total Contacts', value: fmt(c.totalContacts), color: '' },
          { label: 'Attempted',      value: fmt(c.attempted),     color: '' },
          { label: 'Completed',      value: fmt(c.completed),     color: 'text-emerald-700' },
          { label: 'Failed',         value: fmt(c.failed),        color: 'text-destructive' },
          { label: 'Contact Rate',   value: c.contactRate > 0 ? pct(c.contactRate) : '—', color: '' },
          { label: 'Success Rate',   value: c.successRate > 0 ? pct(c.successRate) : '—', color: c.successRate >= 70 ? 'text-emerald-700' : 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="rounded-md border border-border bg-card p-3">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className={cn('mt-0.5 text-lg font-semibold tabular-nums', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Campaign Progress</span>
          <span>{c.progress}% complete</span>
        </div>
        <Progress value={c.progress} className="h-2" />
      </div>
    </div>
  )
}
