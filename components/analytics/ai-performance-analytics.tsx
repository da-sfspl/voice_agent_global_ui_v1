'use client'

import { useState, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  aiKpis, latencyTimeSeries, agentPerformance,
  llmProviderPerformance, sttProviderPerformance, ttsProviderPerformance,
} from '@/lib/analytics-data'
import {
  Zap, Clock, MessageSquare, TrendingUp, ArrowRightLeft,
  Volume2, AudioLines, Brain, RefreshCw, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function fmt(n: number) { return n.toLocaleString() }
function pct(n: number) { return `${n.toFixed(1)}%` }
function fmtMs(n: number) { return `${n}ms` }
function fmtDur(secs: number) {
  const m = Math.floor(secs / 60); const s = secs % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const maxLatency = Math.max(...latencyTimeSeries.map(d => d.llm))

// ─── Agent Performance Distribution data ───────────────────────────────────
type DistributionMetric = 'calls' | 'successfulCalls' | 'escalations' | 'resolutionRate' | 'avgCsat'

type AgentDistribution = {
  agent: string
  calls: number
  successfulCalls: number
  escalations: number
  resolutionRate: number
  avgCsat: number
  color: string
}

type DonutSegment = {
  label: string
  value: number
  color: string
  percentage: number
}

const agentDistributionData: AgentDistribution[] = [
  { agent: 'Customer Support',  calls: 12450, successfulCalls: 11205, escalations: 622, resolutionRate: 88.5, avgCsat: 4.5, color: '#8b5cf6' },
  { agent: 'Sales Assistant',   calls: 8320,  successfulCalls: 7072,  escalations: 416, resolutionRate: 82.1, avgCsat: 4.2, color: '#0ea5e9' },
  { agent: 'Appointment Agent', calls: 6180,  successfulCalls: 5765,  escalations: 185, resolutionRate: 91.2, avgCsat: 4.7, color: '#14b8a6' },
  { agent: 'Technical Support', calls: 7240,  successfulCalls: 6154,  escalations: 869, resolutionRate: 79.4, avgCsat: 4.1, color: '#f59e0b' },
  { agent: 'Billing Agent',     calls: 4950,  successfulCalls: 4257,  escalations: 519, resolutionRate: 76.8, avgCsat: 3.9, color: '#f43f5e' },
]

const distributionMetrics: { value: DistributionMetric; label: string; centerLabel: string }[] = [
  { value: 'calls',           label: 'Call Volume',      centerLabel: 'Total Calls' },
  { value: 'successfulCalls', label: 'Successful Calls', centerLabel: 'Successful Calls' },
  { value: 'escalations',     label: 'Escalations',      centerLabel: 'Total Escalations' },
  { value: 'resolutionRate',  label: 'Resolution Rate',  centerLabel: 'Avg Resolution' },
  { value: 'avgCsat',         label: 'Average CSAT',     centerLabel: 'Avg CSAT' },
]

function getMetricValue(agent: AgentDistribution, metric: DistributionMetric): number {
  switch (metric) {
    case 'calls': return agent.calls
    case 'successfulCalls': return agent.successfulCalls
    case 'escalations': return agent.escalations
    case 'resolutionRate': return agent.resolutionRate
    case 'avgCsat': return agent.avgCsat
  }
}

function formatMetricValue(value: number, metric: DistributionMetric): string {
  switch (metric) {
    case 'calls':
    case 'successfulCalls':
    case 'escalations':
      return fmt(value)
    case 'resolutionRate':
      return `${value.toFixed(1)}%`
    case 'avgCsat':
      return value.toFixed(1)
  }
}

// ─── Donut chart component ─────────────────────────────────────────────────
function AgentDonutChart({
  data,
  centerValue,
  centerLabel,
  hoveredAgent,
}: {
  data: { label: string; value: number; color: string; percentage: number }[]
  centerValue: string
  centerLabel: string
  hoveredAgent: string | null
}) {
  const size = 210
  const strokeWidth = 28
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let cumulative = 0

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-52 w-52">
        {data.map((d) => {
          const dashLength = (d.percentage / 100) * circumference
          const offset = -cumulative
          cumulative += dashLength
          const isDimmed = hoveredAgent !== null && hoveredAgent !== d.label
          return (
            <circle
              key={d.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
              opacity={isDimmed ? 0.3 : 1}
              className="transition-opacity duration-200"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold tabular-nums">{centerValue}</span>
        <span className="text-[11px] text-muted-foreground text-center px-4">{centerLabel}</span>
      </div>
    </div>
  )
}

// ─── Latency line-chart config ─────────────────────────────────────────────
type LatencySeriesKey = 'stt' | 'llm' | 'tts'

const LATENCY_SERIES: { key: LatencySeriesKey; label: string; color: string }[] = [
  { key: 'stt', label: 'STT', color: '#0ea5e9' }, // sky-500
  { key: 'llm', label: 'LLM', color: '#8b5cf6' }, // violet-500
  { key: 'tts', label: 'TTS', color: '#14b8a6' }, // teal-500
]

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

function niceCeil(n: number): number {
  if (n <= 0) return 100
  const mag = Math.pow(10, Math.floor(Math.log10(n)))
  const norm = n / mag
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  const nice = steps.find(s => norm <= s) ?? 10
  return nice * mag
}

// ─── Latency line chart ────────────────────────────────────────────────────
function LatencyLineChart({ data }: { data: { day: string; stt: number; llm: number; tts: number }[] }) {
  const [visible, setVisible] = useState<Record<LatencySeriesKey, boolean>>({ stt: true, llm: true, tts: true })
  const [hover, setHover] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const VB_W = 800
  const VB_H = 280
  const PAD = { top: 20, right: 18, bottom: 34, left: 56 }
  const innerW = VB_W - PAD.left - PAD.right
  const innerH = VB_H - PAD.top - PAD.bottom

  // Y-axis adapts to whichever series are visible
  const visibleKeys = LATENCY_SERIES.filter(s => visible[s.key]).map(s => s.key)
  const allVals = data.flatMap(d => visibleKeys.map(k => d[k]))
  const maxVal = niceCeil((allVals.length ? Math.max(...allVals) : 100) * 1.05)

  const xFor = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const yFor = (v: number) => PAD.top + innerH - (v / maxVal) * innerH

  function toggleSeries(key: LatencySeriesKey) {
    setVisible(v => {
      const next = { ...v, [key]: !v[key] }
      // prevent hiding every series
      if (!Object.values(next).some(Boolean)) return v
      return next
    })
  }

  function handleMove(e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || data.length === 0) return
    const xView = ((e.clientX - rect.left) / rect.width) * VB_W
    const ratio = (xView - PAD.left) / innerW
    const idx = Math.round(ratio * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const xLabelIdxs = Array.from(new Set([
    0,
    Math.floor(data.length * 0.25),
    Math.floor(data.length * 0.5),
    Math.floor(data.length * 0.75),
    data.length - 1,
  ]))

  return (
    <div>
      {/* Interactive legend */}
      <div className="mb-3 flex items-center justify-end gap-5">
        {LATENCY_SERIES.map(s => (
          <button
            key={s.key}
            type="button"
            onClick={() => toggleSeries(s.key)}
            className={cn('flex items-center gap-1.5 text-xs transition-opacity', !visible[s.key] && 'opacity-40')}
            title={visible[s.key] ? `Hide ${s.label}` : `Show ${s.label}`}
          >
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      <div ref={wrapRef} className="relative" onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-64" preserveAspectRatio="none">
          {/* y-axis title */}
          <text transform="rotate(-90)" x={-(PAD.top + innerH / 2)} y={14} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
            Latency (ms)
          </text>

          {/* horizontal gridlines + y labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const val = maxVal * f
            return (
              <g key={f}>
                <line x1={PAD.left} x2={VB_W - PAD.right} y1={yFor(val)} y2={yFor(val)}
                  className="stroke-muted" strokeWidth="1" strokeDasharray={f === 0 ? undefined : '3 4'} />
                <text x={PAD.left - 8} y={yFor(val) + 3} textAnchor="end" fontSize="10" className="fill-muted-foreground">
                  {Math.round(val)}
                </text>
              </g>
            )
          })}

          {/* series lines */}
          {LATENCY_SERIES.filter(s => visible[s.key]).map(s => {
            const pts = data.map((d, i) => ({ x: xFor(i), y: yFor(d[s.key]) }))
            return <path key={s.key} d={smoothPath(pts)} fill="none" stroke={s.color} strokeWidth="2" />
          })}

          {/* hover guide + dots */}
          {hover !== null && (
            <g>
              <line x1={xFor(hover)} x2={xFor(hover)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-muted-foreground/40" strokeWidth="1" />
              {LATENCY_SERIES.filter(s => visible[s.key]).map(s => (
                <circle key={s.key} cx={xFor(hover)} cy={yFor(data[hover][s.key])} r="4" className="fill-background" stroke={s.color} strokeWidth="2" />
              ))}
            </g>
          )}

          {/* x labels */}
          {xLabelIdxs.map(i => (
            <text key={i} x={xFor(i)} y={VB_H - 10} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
              {data[i].day}
            </text>
          ))}
        </svg>

        {/* tooltip */}
        {hover !== null && (
          <div
            className="absolute top-2 z-10 pointer-events-none rounded-md border border-border bg-card shadow-md px-3 py-2 text-xs w-40"
            style={{ left: `${(xFor(hover) / VB_W) * 100}%`, transform: hover > data.length / 2 ? 'translateX(-108%)' : 'translateX(10px)' }}
          >
            <p className="font-semibold mb-1.5">{data[hover].day}</p>
            <div className="space-y-1 tabular-nums">
              {LATENCY_SERIES.map(s => (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                  <span className={cn('font-medium', !visible[s.key] && 'opacity-40')}>{data[hover][s.key]} ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AIPerformanceAnalytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [agentFilter, setAgentFilter] = useState('all')
  const [compareBy, setCompareBy] = useState('agent')

  const [distributionMetric, setDistributionMetric] = useState<DistributionMetric>('calls')
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)

  // Donut data derived from selected metric
  const donutData = useMemo(() => {
    const values = agentDistributionData.map(d => getMetricValue(d, distributionMetric))
    const total = values.reduce((a, b) => a + b, 0)
    return agentDistributionData.map((d, i) => ({
      label: d.agent,
      value: values[i],
      color: d.color,
      percentage: total > 0 ? (values[i] / total) * 100 : 0,
    }))
  }, [distributionMetric])

  const donutCenterValue = useMemo(() => {
    const values = agentDistributionData.map(d => getMetricValue(d, distributionMetric))
    if (distributionMetric === 'resolutionRate' || distributionMetric === 'avgCsat') {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      return distributionMetric === 'resolutionRate' ? `${avg.toFixed(1)}%` : avg.toFixed(2)
    }
    return fmt(values.reduce((a, b) => a + b, 0))
  }, [distributionMetric])

  const donutCenterLabel = distributionMetrics.find(m => m.value === distributionMetric)?.centerLabel || ''


  const kpis = [
    { label: 'E2E Response Latency', value: fmtMs(aiKpis.avgE2ELatencyMs),              icon: Zap,            color: 'bg-amber-100 text-amber-700' },
    { label: 'STT Latency',          value: fmtMs(aiKpis.avgSTTLatencyMs),              icon: AudioLines,     color: 'bg-sky-100 text-sky-700' },
    { label: 'LLM Latency',          value: fmtMs(aiKpis.avgLLMLatencyMs),              icon: Brain,          color: 'bg-violet-100 text-violet-700' },
    { label: 'TTS Latency',          value: fmtMs(aiKpis.avgTTSLatencyMs),              icon: Volume2,        color: 'bg-teal-100 text-teal-700' },
    { label: 'Avg Conv. Duration',   value: fmtDur(aiKpis.avgConversationDurationSecs), icon: Clock,          color: 'bg-blue-100 text-blue-700' },
    { label: 'Avg Turns / Conv.',    value: aiKpis.avgTurnsPerConversation.toFixed(1),  icon: MessageSquare,  color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Success Rate',         value: pct(aiKpis.successfulConversationRate),     icon: TrendingUp,     color: 'bg-primary/10 text-primary' },
    { label: 'Transfer Rate',        value: pct(aiKpis.transferEscalationRate),         icon: ArrowRightLeft, color: 'bg-orange-100 text-orange-700' },
  ]

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">AI Performance</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            AI agent quality and operational metrics — <span className="italic">Estimated data</span>
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
          <Select value={agentFilter} onValueChange={(v) => v && setAgentFilter(v)}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              <SelectItem value="agt-001">Customer Support Agent</SelectItem>
              <SelectItem value="agt-002">Sales Outreach Bot</SelectItem>
              <SelectItem value="agt-003">Appointment Scheduler</SelectItem>
              <SelectItem value="agt-004">Collections & Payment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={compareBy} onValueChange={(v) => v && setCompareBy(v)}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="agent">Compare by Agent</SelectItem>
              <SelectItem value="llm">Compare by LLM</SelectItem>
              <SelectItem value="stt">Compare by STT</SelectItem>
              <SelectItem value="tts">Compare by TTS</SelectItem>
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

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Completion Rate',    value: pct(aiKpis.callCompletionRate),       sub: 'Calls reaching natural end' },
          { label: 'Interruption Rate',  value: pct(aiKpis.interruptionRate),         sub: 'Caller interrupted agent' },
          { label: 'Silence/Timeout',    value: pct(aiKpis.silenceTimeoutRate),       sub: 'Silence or timeout events' },
          { label: 'LLM Tokens Used',    value: `${(aiKpis.totalLLMTokens / 1_000_000).toFixed(1)}M`, sub: 'Total tokens (30 days)' },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums">{k.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Latency Trends */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Latency Trends</h3>
            <p className="text-xs text-muted-foreground">STT · LLM · TTS average latency over time (ms)</p>
          </div>
        </div>
        <LatencyLineChart data={latencyTimeSeries} />
      </div>

      {/* Agent Performance Distribution */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold">Agent Performance Distribution</h3>
            <p className="text-xs text-muted-foreground">See how AI activity and outcomes are distributed across deployed agents.</p>
          </div>
          <Select value={distributionMetric} onValueChange={(v) => v && setDistributionMetric(v as DistributionMetric)}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {distributionMetrics.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Donut + Legend */}
          <div className="lg:col-span-2 flex flex-col items-center gap-4">
            <AgentDonutChart
              data={donutData}
              centerValue={donutCenterValue}
              centerLabel={donutCenterLabel}
              hoveredAgent={hoveredAgent}
            />
            <div className="w-full flex flex-col gap-1">
              {donutData.map(d => (
                <button
                  key={d.label}
                  type="button"
                  onMouseEnter={() => setHoveredAgent(d.label)}
                  onMouseLeave={() => setHoveredAgent(null)}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors',
                    hoveredAgent === d.label ? 'bg-muted' : 'hover:bg-muted/50'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-foreground">{d.label}</span>
                  </span>
                  <span className="flex items-center gap-2 tabular-nums">
                    <span className="text-muted-foreground">{formatMetricValue(d.value, distributionMetric)}</span>
                    <span className="font-medium w-11 text-right">{d.percentage.toFixed(1)}%</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Agent Summary Table */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Agent Summary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Agent', 'Calls', 'Resolution Rate', 'Escalation Rate', 'Avg CSAT'].map(h => (
                      <th key={h} className="pb-2 text-left text-xs font-medium text-muted-foreground pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agentDistributionData.map(a => {
                    const escRate = (a.escalations / a.calls) * 100
                    return (
                      <tr
                        key={a.agent}
                        onMouseEnter={() => setHoveredAgent(a.agent)}
                        onMouseLeave={() => setHoveredAgent(null)}
                        className={cn(
                          'border-b border-border/50 last:border-0 transition-colors',
                          hoveredAgent === a.agent ? 'bg-muted/60' : 'hover:bg-muted/40'
                        )}
                      >
                        <td className="py-2.5 text-sm font-medium pr-4">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: a.color }} />
                            {a.agent}
                          </span>
                        </td>
                        <td className="py-2.5 text-xs tabular-nums pr-4">{fmt(a.calls)}</td>
                        <td className="py-2.5 pr-4">
                          <span className={cn('text-xs font-medium', a.resolutionRate >= 85 ? 'text-emerald-700' : a.resolutionRate >= 78 ? 'text-amber-700' : 'text-destructive')}>
                            {a.resolutionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={cn('text-xs', escRate > 10 ? 'text-destructive' : escRate > 6 ? 'text-amber-700' : 'text-muted-foreground')}>
                            {escRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={cn('text-xs tabular-nums font-medium', a.avgCsat >= 4.3 ? 'text-emerald-700' : a.avgCsat >= 4.0 ? 'text-amber-700' : 'text-muted-foreground')}>
                            {a.avgCsat.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Use the detailed comparison table below for latency, turn counts, and interruption metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-1">Agent Performance Comparison</h3>
        <p className="text-xs text-muted-foreground mb-4">Quality and operational metrics per AI agent</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Agent','Success Rate','Avg Latency','Avg Turns','Completion Rate','Escalation Rate','Interruption Rate'].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-medium text-muted-foreground pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agentPerformance.map((a) => (
                <tr key={a.agent} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 text-sm font-medium pr-4">{a.agent}</td>
                  <td className="py-2.5 pr-4">
                    <span className={cn('text-xs font-medium', a.successRate >= 85 ? 'text-emerald-700' : a.successRate >= 70 ? 'text-amber-700' : 'text-destructive')}>
                      {pct(a.successRate)}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs tabular-nums pr-4">{fmtMs(a.avgLatencyMs)}</td>
                  <td className="py-2.5 text-xs tabular-nums pr-4">{a.avgTurns}</td>
                  <td className="py-2.5 text-xs tabular-nums pr-4">{pct(a.completionRate)}</td>
                  <td className="py-2.5 pr-4">
                    <span className={cn('text-xs', a.escalationRate > 10 ? 'text-destructive' : a.escalationRate > 6 ? 'text-amber-700' : 'text-muted-foreground')}>
                      {pct(a.escalationRate)}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs tabular-nums text-muted-foreground">{pct(a.interruptionRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider Performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* LLM */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">LLM Provider Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">Usage, latency, and cost by LLM</p>
          <div className="flex flex-col gap-3">
            {llmProviderPerformance.map((p) => (
              <div key={p.provider} className="flex flex-col gap-1 rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate max-w-[140px]">{p.provider}</span>
                  <span className="text-[10px] text-muted-foreground">{fmt(p.calls)} calls</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Latency: <span className="text-foreground font-medium">{fmtMs(p.avgLatencyMs)}</span></span>
                  <span>Success: <span className={cn('font-medium', p.successRate >= 85 ? 'text-emerald-700' : 'text-amber-700')}>{pct(p.successRate)}</span></span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{(p.tokens / 1_000_000).toFixed(1)}M tokens</span>
                  <span className="font-medium">${p.costUsd.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STT */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">STT Provider Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">Usage, latency, and accuracy by STT</p>
          <div className="flex flex-col gap-3">
            {sttProviderPerformance.map((p) => (
              <div key={p.provider} className="flex flex-col gap-1 rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate max-w-[140px]">{p.provider}</span>
                  <span className={cn('text-[10px] font-medium', p.accuracyIndicator === 'High' ? 'text-emerald-700' : 'text-amber-700')}>
                    {p.accuracyIndicator} accuracy
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Latency: <span className="text-foreground font-medium">{fmtMs(p.avgLatencyMs)}</span></span>
                  <span>{fmt(p.minutes)} min</span>
                </div>
                <span className="text-[11px] font-medium">${p.costUsd.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TTS */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">TTS Provider Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">Usage, latency, and cost by TTS</p>
          <div className="flex flex-col gap-3">
            {ttsProviderPerformance.map((p) => (
              <div key={p.provider} className="flex flex-col gap-1 rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate max-w-[140px]">{p.provider}</span>
                  <span className={cn('text-[10px]', p.streamingEnabled ? 'text-emerald-700' : 'text-muted-foreground')}>
                    {p.streamingEnabled ? 'Streaming' : 'Non-streaming'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Latency: <span className="text-foreground font-medium">{fmtMs(p.avgLatencyMs)}</span></span>
                  <span>{(p.chars / 1_000_000).toFixed(1)}M chars</span>
                </div>
                <span className="text-[11px] font-medium">${p.costUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          { label: 'Total LLM Tokens', value: `${(aiKpis.totalLLMTokens / 1_000_000).toFixed(1)}M`, sub: 'Across all LLM providers' },
          { label: 'Total STT Minutes', value: `${(aiKpis.totalSTTMinutes / 1000).toFixed(1)}K min`, sub: 'Transcription volume' },
          { label: 'Total TTS Characters', value: `${(aiKpis.totalTTSChars / 1_000_000).toFixed(1)}M chars`, sub: 'Speech synthesis volume' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
