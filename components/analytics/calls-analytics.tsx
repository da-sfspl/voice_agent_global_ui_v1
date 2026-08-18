'use client'

import { useState, useMemo, useRef } from 'react'
import {
  PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneOff, PhoneForwarded,
  CheckCircle2, Clock, TrendingUp, TrendingDown, RefreshCw, Download,
  Filter, ArrowUp, ArrowDown, ArrowUpDown, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
// import { fmt, pct, fmtDur } from '@/lib/analytics-format'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { callsByProvider, callsByCampaign } from '@/lib/data'

// ─── Badge color maps (preserved) ──────────────────────────────────────────
const outcomeColors: Record<string, string> = {
  resolved:           'text-emerald-700 bg-emerald-50 border-emerald-200',
  'demo-scheduled':   'text-blue-700 bg-blue-50 border-blue-200',
  voicemail:          'text-amber-700 bg-amber-50 border-amber-200',
  transferred:        'text-violet-700 bg-violet-50 border-violet-200',
  'no-answer':        'text-orange-700 bg-orange-50 border-orange-200',
  dropped:            'text-red-700 bg-red-50 border-red-200',
  failed:             'text-red-800 bg-red-100 border-red-300',
  'payment-arranged': 'text-teal-700 bg-teal-50 border-teal-200',
}

const statusColors: Record<string, string> = {
  completed:   'text-emerald-700 bg-emerald-50 border-emerald-200',
  voicemail:   'text-amber-700 bg-amber-50 border-amber-200',
  dropped:     'text-red-700 bg-red-50 border-red-200',
  failed:      'text-red-800 bg-red-100 border-red-300',
  transferred: 'text-violet-700 bg-violet-50 border-violet-200',
  missed:      'text-orange-700 bg-orange-50 border-orange-200',
}

function fmt(n: number) { return n.toLocaleString() }
function pct(n: number) { return `${n.toFixed(1)}%` }
function fmtMs(n: number) { return `${n}ms` }
function fmtDur(secs: number) {
  const m = Math.floor(secs / 60); const s = secs % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

// ─── Types ─────────────────────────────────────────────────────────────────
type VolumePoint = {
  date: string
  total: number
  completed: number
  escalated: number
  failed: number
  abandoned: number
}
type VolumeMetric = 'total' | 'completed' | 'escalated' | 'failed'

// ─── Deterministic dummy volume series (90 days, no Math.random) ───────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const frac = (n: number) => n - Math.floor(n)

const volumeSeries: VolumePoint[] = (() => {
  const pts: VolumePoint[] = []
  const DAYS = 90
  const end = new Date(2026, 7, 14) // Aug 14, 2026 (deterministic reference)
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    const idx = DAYS - i
    const weekend = d.getDay() === 0 || d.getDay() === 6
    const r1 = frac(Math.sin(idx * 12.9898) * 43758.5453)
    const r2 = frac(Math.sin(idx * 78.233) * 12543.21)
    const wave = Math.sin(idx / 5.5) * 70
    const total = Math.max(80, Math.round((weekend ? 360 : 600) + wave + r1 * 140))
    const completed = Math.round(total * (0.66 + r2 * 0.14))
    const escalated = Math.round(total * (0.06 + r1 * 0.04))
    const abandoned = Math.round(total * (0.04 + r2 * 0.04))
    const failed = Math.max(0, total - completed - escalated - abandoned)
    pts.push({ date: `${MONTHS[d.getMonth()]} ${d.getDate()}`, total, completed, escalated, failed, abandoned })
  }
  return pts
})()

function aggregateWeekly(data: VolumePoint[]): VolumePoint[] {
  const weeks: VolumePoint[] = []
  for (let i = 0; i < data.length; i += 7) {
    const chunk = data.slice(i, i + 7)
    weeks.push({
      date: chunk[0].date,
      total: chunk.reduce((s, d) => s + d.total, 0),
      completed: chunk.reduce((s, d) => s + d.completed, 0),
      escalated: chunk.reduce((s, d) => s + d.escalated, 0),
      failed: chunk.reduce((s, d) => s + d.failed, 0),
      abandoned: chunk.reduce((s, d) => s + d.abandoned, 0),
    })
  }
  return weeks
}

// ─── Agent call data (powers bars, table, insights) ────────────────────────
type AgentCall = { agent: string; total: number; completed: number; escalated: number; failed: number; avgDurationSecs: number }
const agentCallData: AgentCall[] = [
  { agent: 'Customer Support Agent',   total: 4820, completed: 4290, escalated: 290, failed: 240, avgDurationSecs: 312 },
  { agent: 'Technical Support Agent',  total: 3120, completed: 2590, escalated: 405, failed: 125, avgDurationSecs: 402 },
  { agent: 'Sales Agent',              total: 3650, completed: 2920, escalated: 255, failed: 475, avgDurationSecs: 268 },
  { agent: 'Appointment Agent',        total: 2980, completed: 2770, escalated: 95,  failed: 115, avgDurationSecs: 195 },
  { agent: 'Billing Agent',            total: 2410, completed: 1975, escalated: 265, failed: 170, avgDurationSecs: 348 },
]

// ─── Filter option lists + recent calls (self-consistent local data) ───────
const agentOptions = agentCallData.map(a => a.agent)
const campaignOptions = ['Q3 Retention Outreach', 'Payment Reminders', 'Appointment Confirmations', 'Renewal Calls', 'Welcome Series']

const recentCalls = [
  { id: 'call-9f2k1', contact: 'Priya Sharma',   number: '+91 98200 11223', direction: 'inbound',  agent: 'Customer Support Agent',  campaign: '—', duration: '4m 12s',  outcome: 'resolved',          status: 'completed',   time: 'Aug 14, 10:42 AM' },
  { id: 'call-8d3m4', contact: 'Rahul Verma',    number: '+91 90040 55678', direction: 'outbound', agent: 'Sales Agent',              campaign: 'Q3 Retention Outreach', duration: '6m 05s', outcome: 'demo-scheduled', status: 'completed', time: 'Aug 14, 10:31 AM' },
  { id: 'call-7c9p2', contact: 'Anita Desai',    number: '+91 98111 22334', direction: 'inbound',  agent: 'Billing Agent',            campaign: '—', duration: '9m 48s',  outcome: 'payment-arranged',  status: 'completed',   time: 'Aug 14, 10:18 AM' },
  { id: 'call-6b4q8', contact: 'Vikram Iyer',    number: '+91 99870 33445', direction: 'outbound', agent: 'Technical Support Agent',  campaign: 'Renewal Calls', duration: '2m 20s', outcome: 'no-answer', status: 'missed', time: 'Aug 14, 09:57 AM' },
  { id: 'call-5a1r7', contact: 'Sneha Kulkarni', number: '+91 98330 44556', direction: 'inbound',  agent: 'Appointment Agent',        campaign: '—', duration: '3m 44s',  outcome: 'resolved',          status: 'completed',   time: 'Aug 14, 09:45 AM' },
  { id: 'call-4z8s3', contact: 'Arjun Mehta',    number: '+91 90040 77889', direction: 'outbound', agent: 'Sales Agent',              campaign: 'Q3 Retention Outreach', duration: '1m 02s', outcome: 'voicemail', status: 'voicemail', time: 'Aug 14, 09:30 AM' },
  { id: 'call-3y5t9', contact: 'Kavya Nair',     number: '+91 98450 88990', direction: 'inbound',  agent: 'Customer Support Agent',   campaign: '—', duration: '7m 15s',  outcome: 'transferred',       status: 'transferred', time: 'Aug 14, 09:12 AM' },
  { id: 'call-2x6u5', contact: 'Rohan Gupta',    number: '+91 98990 11002', direction: 'outbound', agent: 'Billing Agent',            campaign: 'Payment Reminders', duration: '0m 48s', outcome: 'dropped', status: 'dropped', time: 'Aug 14, 08:58 AM' },
  { id: 'call-1w3v2', contact: 'Ishita Bose',    number: '+91 90070 22113', direction: 'inbound',  agent: 'Technical Support Agent',  campaign: '—', duration: '11m 30s', outcome: 'resolved',          status: 'completed',   time: 'Aug 14, 08:41 AM' },
  { id: 'call-0u7x4', contact: 'Dev Patel',      number: '+91 98205 33224', direction: 'outbound', agent: 'Appointment Agent',        campaign: 'Appointment Confirmations', duration: '2m 55s', outcome: 'resolved', status: 'completed', time: 'Aug 14, 08:22 AM' },
]

const outcomeStatusMap: Record<string, string[]> = {
  completed: ['completed'],
  escalated: ['transferred'],
  failed: ['failed', 'dropped'],
  abandoned: ['missed', 'no-answer', 'voicemail'],
}

const metricColor: Record<VolumeMetric, string> = {
  total: 'hsl(var(--primary))',
  completed: '#10b981',
  escalated: '#8b5cf6',
  failed: '#ef4444',
}

// ─── Smooth path helper (catmull-rom → cubic bezier) ───────────────────────
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1]
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`
  }
  return d
}

// ─── Area + Line chart ─────────────────────────────────────────────────────
const VB_W = 800
const VB_H = 280
const PAD = { top: 24, right: 18, bottom: 34, left: 48 }

function AreaLineChart({ data, metric }: { data: VolumePoint[]; metric: VolumeMetric }) {
  const [hover, setHover] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const innerW = VB_W - PAD.left - PAD.right
  const innerH = VB_H - PAD.top - PAD.bottom
  const values = data.map(d => d[metric])
  const maxVal = Math.max(...values, 1) * 1.15
  const xFor = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const yFor = (v: number) => PAD.top + innerH - (v / maxVal) * innerH

  const points = data.map((d, i) => ({ x: xFor(i), y: yFor(d[metric]) }))
  const linePath = smoothPath(points)
  const areaPath = `${linePath} L ${xFor(data.length - 1)} ${PAD.top + innerH} L ${xFor(0)} ${PAD.top + innerH} Z`
  const peakIdx = values.indexOf(Math.max(...values))
  const color = metricColor[metric]

  const gridFracs = [0.25, 0.5, 0.75, 1]
  const xLabelIdxs = Array.from(new Set([
    0,
    Math.floor(data.length * 0.25),
    Math.floor(data.length * 0.5),
    Math.floor(data.length * 0.75),
    data.length - 1,
  ]))

  function handleMove(e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || data.length === 0) return
    const xView = ((e.clientX - rect.left) / rect.width) * VB_W
    const ratio = (xView - PAD.left) / innerW
    const idx = Math.round(ratio * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const hp = hover !== null ? data[hover] : null

  return (
    <div ref={wrapRef} className="relative" onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-64" preserveAspectRatio="none">
        <defs>
          <linearGradient id="callVolArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.02 }} />
          </linearGradient>
        </defs>

        {gridFracs.map(f => {
          const gv = maxVal * f
          return (
            <g key={f}>
              <line x1={PAD.left} x2={VB_W - PAD.right} y1={yFor(gv)} y2={yFor(gv)} className="stroke-muted" strokeWidth="1" strokeDasharray="3 4" />
              <text x={PAD.left - 8} y={yFor(gv) + 3} textAnchor="end" fontSize="10" className="fill-muted-foreground">{fmt(Math.round(gv))}</text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#callVolArea)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" />

        {/* peak marker */}
        <circle cx={xFor(peakIdx)} cy={yFor(values[peakIdx])} r="4" fill={color} />
        <text x={xFor(peakIdx)} y={yFor(values[peakIdx]) - 10} textAnchor="middle" fontSize="9" className="fill-muted-foreground">Peak</text>

        {/* hover guide */}
        {hover !== null && (
          <g>
            <line x1={xFor(hover)} x2={xFor(hover)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-muted-foreground/40" strokeWidth="1" />
            <circle cx={xFor(hover)} cy={yFor(values[hover])} r="4.5" className="fill-background" stroke={color} strokeWidth="2" />
          </g>
        )}

        {xLabelIdxs.map(i => (
          <text key={i} x={xFor(i)} y={VB_H - 10} textAnchor="middle" fontSize="10" className="fill-muted-foreground">{data[i].date}</text>
        ))}
      </svg>

      {hp && hover !== null && (
        <div
          className="absolute top-3 z-10 pointer-events-none rounded-md border border-border bg-card shadow-md px-3 py-2 text-xs w-44"
          style={{ left: `${(xFor(hover) / VB_W) * 100}%`, transform: hover > data.length / 2 ? 'translateX(-108%)' : 'translateX(10px)' }}
        >
          <p className="font-semibold mb-1.5">{hp.date}</p>
          <div className="space-y-1 tabular-nums">
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>{fmt(hp.total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="text-emerald-700">{fmt(hp.completed)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Escalated</span><span className="text-violet-700">{fmt(hp.escalated)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Failed</span><span className="text-destructive">{fmt(hp.failed)}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Outcomes donut ────────────────────────────────────────────────────────
function OutcomeDonut({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const size = 180
  const sw = 26
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const center = size / 2
  let cum = 0
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44">
        {data.map(d => {
          const len = total > 0 ? (d.count / total) * c : 0
          const off = -cum
          cum += len
          return (
            <circle key={d.label} cx={center} cy={center} r={r} fill="none" stroke={d.color} strokeWidth={sw}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={off} transform={`rotate(-90 ${center} ${center})`} />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold tabular-nums">{fmt(total)}</span>
        <span className="text-[11px] text-muted-foreground">Total Calls</span>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────
export function CallsAnalytics() {
  // Global filters
  const [dateRange, setDateRange] = useState('30d')
  const [agentFilter, setAgentFilter] = useState('all')
  const [direction, setDirection] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [outcomeFilter, setOutcomeFilter] = useState('all')

  // Volume chart controls
  const [volumeMetric, setVolumeMetric] = useState<VolumeMetric>('total')
  const [granularity, setGranularity] = useState('daily')

  // Calls-by-agent bar metric
  const [agentBarMetric, setAgentBarMetric] = useState<VolumeMetric>('total')

  // Performance table sort
  const [sortKey, setSortKey] = useState<'total' | 'completionRate' | 'escalationRate' | 'avgDuration'>('total')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const rangeDays = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30
  const rangeSeries = useMemo(() => volumeSeries.slice(-rangeDays), [rangeDays])

  const chartData = useMemo(() => {
    const effGran = granularity === 'weekly' && rangeDays <= 7 ? 'daily' : granularity
    return effGran === 'weekly' ? aggregateWeekly(rangeSeries) : rangeSeries
  }, [rangeSeries, granularity, rangeDays])

  // Aggregated totals over the selected range (drives KPIs + donut)
  const totals = useMemo(() => rangeSeries.reduce((acc, d) => ({
    total: acc.total + d.total,
    completed: acc.completed + d.completed,
    escalated: acc.escalated + d.escalated,
    failed: acc.failed + d.failed,
    abandoned: acc.abandoned + d.abandoned,
  }), { total: 0, completed: 0, escalated: 0, failed: 0, abandoned: 0 }), [rangeSeries])

  const avgDurationSecs = 305

  // KPI cards
  const kpis = [
    { label: 'Total Calls',      value: fmt(totals.total),                       icon: PhoneCall,      color: 'bg-primary/10 text-primary' },
    { label: 'Completed Calls',  value: fmt(totals.completed),                   icon: CheckCircle2,   color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Completion Rate',  value: pct(totals.completed / (totals.total || 1)), icon: TrendingUp, color: 'bg-teal-100 text-teal-700' },
    { label: 'Escalated Calls',  value: fmt(totals.escalated),                   icon: PhoneForwarded, color: 'bg-violet-100 text-violet-700' },
    { label: 'Failed Calls',     value: fmt(totals.failed),                      icon: PhoneOff,       color: 'bg-red-100 text-red-700' },
    { label: 'Avg Call Duration',value: fmtDur(avgDurationSecs),                 icon: Clock,          color: 'bg-sky-100 text-sky-700' },
  ]

  // Volume summary chips
  const metricVals = chartData.map(d => d[volumeMetric])
  const peakVal = Math.max(...metricVals, 0)
  const lowVal = Math.min(...metricVals, 0)
  const avgVal = metricVals.length ? metricVals.reduce((a, b) => a + b, 0) / metricVals.length : 0
  const peakDay = chartData[metricVals.indexOf(peakVal)]?.date ?? '—'
  const lowDay = chartData[metricVals.indexOf(lowVal)]?.date ?? '—'

  // Outcomes donut data
  const outcomeData = [
    { label: 'Completed', count: totals.completed, color: '#10b981' },
    { label: 'Escalated', count: totals.escalated, color: '#8b5cf6' },
    { label: 'Failed',    count: totals.failed,    color: '#ef4444' },
    { label: 'Abandoned', count: totals.abandoned, color: '#f59e0b' },
  ]
  const outcomeTotal = outcomeData.reduce((s, d) => s + d.count, 0)

  // Calls by agent (horizontal bars)
  const maxAgentBar = Math.max(...agentCallData.map(a => a[agentBarMetric]), 1)

  // Performance table rows + sort
  const agentRows = useMemo(() => agentCallData.map(a => ({
    ...a,
    completionRate: a.completed / (a.total || 1),
    escalationRate: a.escalated / (a.total || 1),
  })), [])

  const sortedAgentRows = useMemo(() => {
    const arr = [...agentRows]
    arr.sort((x, y) => {
      const get = (r: typeof x) =>
        sortKey === 'total' ? r.total :
        sortKey === 'completionRate' ? r.completionRate :
        sortKey === 'escalationRate' ? r.escalationRate : r.avgDurationSecs
      return sortDir === 'asc' ? get(x) - get(y) : get(y) - get(x)
    })
    return arr
  }, [agentRows, sortKey, sortDir])

  function handleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  // Top agent insights
  const insights = useMemo(() => {
    const byTotal = [...agentRows].sort((a, b) => b.total - a.total)[0]
    const byComp = [...agentRows].sort((a, b) => b.completionRate - a.completionRate)[0]
    const byEsc = [...agentRows].sort((a, b) => a.escalationRate - b.escalationRate)[0]
    const byDur = [...agentRows].sort((a, b) => b.avgDurationSecs - a.avgDurationSecs)[0]
    return [
      { label: 'Highest Call Volume',    agent: byTotal.agent, value: fmt(byTotal.total),           icon: PhoneCall,    color: 'bg-primary/10 text-primary' },
      { label: 'Highest Completion Rate',agent: byComp.agent,  value: pct(byComp.completionRate),   icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
      { label: 'Lowest Escalation Rate', agent: byEsc.agent,   value: pct(byEsc.escalationRate),    icon: TrendingDown, color: 'bg-violet-100 text-violet-700' },
      { label: 'Longest Avg Call',       agent: byDur.agent,   value: fmtDur(byDur.avgDurationSecs),icon: Clock,        color: 'bg-sky-100 text-sky-700' },
    ]
  }, [agentRows])

  // Filtered recent calls
  const filteredCalls = recentCalls.filter(r => {
    if (direction !== 'all' && r.direction !== direction) return false
    if (agentFilter !== 'all' && r.agent !== agentFilter) return false
    if (campaignFilter !== 'all' && r.campaign !== campaignFilter) return false
    if (outcomeFilter !== 'all' && !(outcomeStatusMap[outcomeFilter] || []).includes(r.status)) return false
    return true
  })

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey !== col ? <ArrowUpDown className="h-3 w-3 opacity-50" />
      : sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Calls Analytics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          What is happening with your calls, which agents are handling them, and the outcomes &middot; <span className="italic">Estimated data</span>
        </p>
      </div>

      {/* Global Filters */}
      <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground ml-1" />
        <Select value={dateRange} onValueChange={(v) => v && setDateRange(v)}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={(v) => v && setAgentFilter(v)}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agentOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={direction} onValueChange={(v) => v && setDirection(v)}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All directions</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>
        <Select value={campaignFilter} onValueChange={(v) => v && setCampaignFilter(v)}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {campaignOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={(v) => v && setOutcomeFilter(v)}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="abandoned">Abandoned</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Download className="h-3.5 w-3.5" /> Export</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map(k => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', k.color)}><k.icon className="h-3.5 w-3.5" /></div>
            </div>
            <span className="text-2xl font-semibold tabular-nums">{k.value}</span>
          </div>
        ))}
      </div>

      {/* Call Volume Over Time — primary chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-3 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold">Call Volume Over Time</h3>
            <p className="text-xs text-muted-foreground">Last {rangeDays} days &middot; {granularity === 'weekly' ? 'weekly' : 'daily'} &middot; {volumeMetric}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={volumeMetric} onValueChange={(v) => v && setVolumeMetric(v as VolumeMetric)}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total Calls</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={granularity} onValueChange={(v) => v && setGranularity(v)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AreaLineChart data={chartData} metric={volumeMetric} />

        {/* Summary chips */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Peak volume</p>
            <p className="text-sm font-semibold tabular-nums">{fmt(peakVal)} <span className="text-[11px] font-normal text-muted-foreground">on {peakDay}</span></p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Average / {granularity === 'weekly' ? 'week' : 'day'}</p>
            <p className="text-sm font-semibold tabular-nums">{fmt(Math.round(avgVal))}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Lowest volume</p>
            <p className="text-sm font-semibold tabular-nums">{fmt(lowVal)} <span className="text-[11px] font-normal text-muted-foreground">on {lowDay}</span></p>
          </div>
        </div>
      </div>

      {/* Calls by Agent | Call Outcomes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Calls by Agent — horizontal bars */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Calls by Agent</h3>
              <p className="text-xs text-muted-foreground">Compare call volume across agents</p>
            </div>
            <Select value={agentBarMetric} onValueChange={(v) => v && setAgentBarMetric(v as VolumeMetric)}>
              <SelectTrigger className="h-8 w-30 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total Calls</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            {agentCallData.map(a => {
              const val = a[agentBarMetric]
              const width = (val / maxAgentBar) * 100
              return (
                <div key={a.agent} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{a.agent}</span>
                    <span className="text-muted-foreground tabular-nums">{fmt(val)}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/75 group-hover:bg-primary transition-colors" style={{ width: `${width}%` }} title={`${a.agent}: ${fmt(val)}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Call Outcomes — donut */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Call Outcomes</h3>
          <p className="text-xs text-muted-foreground mb-3">Part-to-whole breakdown of final outcomes</p>
          <div className="flex items-center gap-6 flex-wrap">
            <OutcomeDonut data={outcomeData} />
            <div className="flex flex-col gap-2.5 flex-1 min-w-[160px]">
              {outcomeData.map(o => {
                const p = outcomeTotal > 0 ? (o.count / outcomeTotal) * 100 : 0
                return (
                  <div key={o.label} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: o.color }} />
                    <span className="text-foreground flex-1">{o.label}</span>
                    <span className="text-muted-foreground tabular-nums">{fmt(o.count)}</span>
                    <span className="w-12 text-right font-medium tabular-nums">{p.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Call Performance — sortable table */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-1">Agent Call Performance</h3>
        <p className="text-xs text-muted-foreground mb-4">Click a column header to sort</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground pr-4">Agent</th>
                {([
                  ['total', 'Total Calls'],
                  ['completionRate', 'Completion Rate'],
                  ['escalationRate', 'Escalation Rate'],
                  ['avgDuration', 'Avg Duration'],
                ] as [typeof sortKey, string][]).map(([key, label]) => (
                  <th key={key} className="pb-2 text-right text-xs font-medium text-muted-foreground pr-4 whitespace-nowrap">
                    <button onClick={() => handleSort(key)} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                      {label} <SortIcon col={key} />
                    </button>
                  </th>
                ))}
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Failed</th>
              </tr>
            </thead>
            <tbody>
              {sortedAgentRows.map(a => (
                <tr key={a.agent} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 text-sm font-medium pr-4">{a.agent}</td>
                  <td className="py-2.5 text-right text-xs tabular-nums pr-4">{fmt(a.total)}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className={cn('h-full rounded-full', a.completionRate >= 0.85 ? 'bg-emerald-500' : a.completionRate >= 0.75 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${a.completionRate * 100}%` }} />
                      </div>
                      <span className="text-xs tabular-nums w-12 text-right">{pct(a.completionRate)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right pr-4">
                    <span className={cn('text-xs tabular-nums', a.escalationRate > 0.1 ? 'text-destructive' : a.escalationRate > 0.07 ? 'text-amber-700' : 'text-muted-foreground')}>
                      {pct(a.escalationRate)}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-xs tabular-nums pr-4">{fmtDur(a.avgDurationSecs)}</td>
                  <td className="py-2.5 text-right text-xs tabular-nums text-muted-foreground">{fmt(a.failed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Agent Insights */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {insights.map(i => (
          <div key={i.label} className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-md shrink-0', i.color)}><i.icon className="h-4 w-4" /></div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{i.label}</p>
              <p className="text-sm font-semibold tabular-nums truncate">{i.value}</p>
              <p className="text-[11px] text-muted-foreground truncate">{i.agent}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calls by Campaign | Calls by Provider (preserved) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
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
                {callsByCampaign.map(c => (
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

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Calls by Provider</h3>
          <p className="text-xs text-muted-foreground mb-4">SIP / telephony provider distribution</p>
          <div className="flex flex-col gap-3">
            {callsByProvider.map(p => (
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
        </div>
      </div>

      {/* Recent Call Records */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Recent Call Records</h3>
            <p className="text-xs text-muted-foreground">{filteredCalls.length} of {recentCalls.length} calls shown &middot; drill-down into individual records</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Direction', 'Caller / Contact', 'Agent', 'Campaign', 'Duration', 'Status', 'Outcome', 'Time'].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCalls.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-xs text-muted-foreground">No calls match the selected filters.</td></tr>
              )}
              {filteredCalls.map(r => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 text-xs font-mono text-muted-foreground pr-4">{r.id}</td>
                  <td className="py-2.5 pr-4">
                    {r.direction === 'inbound'
                      ? <PhoneIncoming className="h-3.5 w-3.5 text-emerald-600" />
                      : <PhoneOutgoing className="h-3.5 w-3.5 text-blue-600" />}
                  </td>
                  <td className="py-2.5 pr-4">
                    <p className="text-xs font-medium whitespace-nowrap">{r.contact}</p>
                    <p className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">{r.number}</p>
                  </td>
                  <td className="py-2.5 text-xs pr-4 max-w-[150px] truncate">{r.agent}</td>
                  <td className="py-2.5 text-xs pr-4 max-w-[150px] truncate text-muted-foreground">{r.campaign}</td>
                  <td className="py-2.5 text-xs tabular-nums pr-4">{r.duration}</td>
                  <td className="py-2.5 pr-4">
                    <span className={cn('inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize', statusColors[r.status] ?? 'text-muted-foreground bg-muted border-border')}>{r.status}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={cn('inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium', outcomeColors[r.outcome] ?? 'text-muted-foreground bg-muted border-border')}>{r.outcome}</span>
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