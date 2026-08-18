'use client'

import { useState, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  costKpis, costTimeSeries, costByAgent, costByCampaign,
  llmCostBreakdown, sttCostBreakdown, ttsCostBreakdown, telephonyCostBreakdown,
} from '@/lib/analytics-data'
import {
  DollarSign, Brain, AudioLines, Volume2, Phone,
  TrendingUp, RefreshCw, Download, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function fmt(n: number) { return n.toLocaleString() }
// function usd(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function inr(n: number) { return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function inr4(n: number) { return `₹${n.toFixed(4)}` }


// ─── Cost series config ────────────────────────────────────────────────────
type CostSeriesKey = 'llm' | 'stt' | 'tts' | 'telephony'
type CostPoint = { day: string; llm: number; stt: number; tts: number; telephony: number }

const SERVICE_COLORS: Record<CostSeriesKey, string> = {
  llm: '#8b5cf6',       // violet-500
  stt: '#0ea5e9',       // sky-500
  tts: '#14b8a6',       // teal-500
  telephony: '#3b82f6', // blue-500
}

const COST_SERIES: { key: CostSeriesKey; label: string }[] = [
  { key: 'llm', label: 'LLM' },
  { key: 'stt', label: 'STT' },
  { key: 'tts', label: 'TTS' },
  { key: 'telephony', label: 'Telephony' },
]

// ─── Provider usage over time (which provider was actually used per period) ─
const providerUsageTimeline = [
  { period: 'Jul 9 – Jul 20',  llm: 'OpenAI',    stt: 'Deepgram', tts: 'Cartesia' },
  { period: 'Jul 21 – Jul 31', llm: 'OpenAI',    stt: 'Deepgram', tts: 'ElevenLabs' },
  { period: 'Aug 1 – Aug 7',   llm: 'Anthropic', stt: 'Deepgram', tts: 'ElevenLabs' },
]

// ─── Stacked cost trend chart ──────────────────────────────────────────────
function StackedCostChart({ data }: { data: CostPoint[] }) {
  const [visible, setVisible] = useState<Record<CostSeriesKey, boolean>>({ llm: true, stt: true, tts: true, telephony: true })
  const [hover, setHover] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const VB_W = 800
  const VB_H = 280
  const PAD = { top: 20, right: 18, bottom: 34, left: 54 }
  const innerW = VB_W - PAD.left - PAD.right
  const innerH = VB_H - PAD.top - PAD.bottom

  const stacked = useMemo(() => data.map(d => {
    let cum = 0
    const layers: Partial<Record<CostSeriesKey, { y0: number; y1: number }>> = {}
    for (const s of COST_SERIES) {
      if (!visible[s.key]) continue
      const y0 = cum
      cum += d[s.key]
      layers[s.key] = { y0, y1: cum }
    }
    return { day: d.day, layers, total: cum, raw: d }
  }), [data, visible])

  const maxVal = Math.max(...stacked.map(p => p.total), 1) * 1.08
  const xFor = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const yFor = (v: number) => PAD.top + innerH - (v / maxVal) * innerH

  function toggle(key: CostSeriesKey) {
    setVisible(v => {
      const next = { ...v, [key]: !v[key] }
      if (!Object.values(next).some(Boolean)) return v
      return next
    })
  }

  function areaPath(key: CostSeriesKey) {
    const n = stacked.length
    if (n === 0) return ''
    let d = ''
    for (let i = 0; i < n; i++) d += `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(stacked[i].layers[key]?.y1 ?? 0)} `
    for (let i = n - 1; i >= 0; i--) d += `L ${xFor(i)} ${yFor(stacked[i].layers[key]?.y0 ?? 0)} `
    return d + 'Z'
  }
  function topPath(key: CostSeriesKey) {
    return stacked.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.layers[key]?.y1 ?? 0)}`).join(' ')
  }

  function handleMove(e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || data.length === 0) return
    const xView = ((e.clientX - rect.left) / rect.width) * VB_W
    const idx = Math.round(((xView - PAD.left) / innerW) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const axisUsd = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`)
  const xLabelIdxs = Array.from(new Set([0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1]))
  const hp = hover !== null ? stacked[hover] : null

  return (
    <div>
      {/* Interactive legend */}
      <div className="mb-3 flex items-center justify-end gap-5">
        {COST_SERIES.map(s => (
          <button key={s.key} type="button" onClick={() => toggle(s.key)}
            className={cn('flex items-center gap-1.5 text-xs transition-opacity', !visible[s.key] && 'opacity-40')}
            title={visible[s.key] ? `Hide ${s.label}` : `Show ${s.label}`}>
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: SERVICE_COLORS[s.key] }} />
            {s.label}
          </button>
        ))}
      </div>

      <div ref={wrapRef} className="relative" onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-64" preserveAspectRatio="none">
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const val = maxVal * f
            return (
              <g key={f}>
                <line x1={PAD.left} x2={VB_W - PAD.right} y1={yFor(val)} y2={yFor(val)} className="stroke-muted" strokeWidth="1" strokeDasharray={f === 0 ? undefined : '3 4'} />
                <text x={PAD.left - 8} y={yFor(val) + 3} textAnchor="end" fontSize="10" className="fill-muted-foreground">{axisUsd(val)}</text>
              </g>
            )
          })}

          {COST_SERIES.filter(s => visible[s.key]).map(s => (
            <g key={s.key}>
              <path d={areaPath(s.key)} fill={SERVICE_COLORS[s.key]} fillOpacity="0.55" />
              <path d={topPath(s.key)} fill="none" stroke={SERVICE_COLORS[s.key]} strokeWidth="1.5" />
            </g>
          ))}

          {hover !== null && (
            <line x1={xFor(hover)} x2={xFor(hover)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-muted-foreground/40" strokeWidth="1" />
          )}

          {xLabelIdxs.map(i => (
            <text key={i} x={xFor(i)} y={VB_H - 10} textAnchor="middle" fontSize="10" className="fill-muted-foreground">{data[i].day}</text>
          ))}
        </svg>

        {hp && hover !== null && (
          <div className="pointer-events-none absolute top-2 z-10 w-44 rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md"
            style={{ left: `${(xFor(hover) / VB_W) * 100}%`, transform: hover > data.length / 2 ? 'translateX(-105%)' : 'translateX(10px)' }}>
            <p className="mb-1.5 font-semibold">{hp.day}</p>
            <div className="space-y-1 tabular-nums">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{inr(hp.total)}</span></div>
              {COST_SERIES.filter(s => visible[s.key]).map(s => (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: SERVICE_COLORS[s.key] }} />{s.label}</span>
                  <span>{inr(hp.raw[s.key])}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Cost distribution donut ───────────────────────────────────────────────
function CostDonut({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const size = 190
  const sw = 26
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const center = size / 2
  let cum = 0
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48">
        {segments.map(s => {
          const len = total > 0 ? (s.value / total) * c : 0
          const off = -cum
          cum += len
          return <circle key={s.label} cx={center} cy={center} r={r} fill="none" stroke={s.color} strokeWidth={sw} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={off} transform={`rotate(-90 ${center} ${center})`} />
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums">{inr(total)}</span>
        <span className="text-[11px] text-muted-foreground">Total Cost</span>
      </div>
    </div>
  )
}

// ─── Reusable provider cost breakdown card ─────────────────────────────────
function ProviderCostCard({ title, color, items }: {
  title: string
  color: string
  items: { provider: string; costUsd: number; pct: number; usageLabel: string }[]
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">Actual provider usage and incurred cost during the selected period</p>
      <div className="flex flex-col gap-2.5">
        {items.map(p => (
          <div key={p.provider}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="truncate max-w-[200px]">{p.provider}</span>
              <span className="font-semibold tabular-nums ml-2">{inr(p.costUsd)} ({p.pct}%)</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: color }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{p.usageLabel}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CostAnalytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')

  const kpis = [
    { label: 'Total Estimated Cost', value: inr(costKpis.totalEstimatedCost), icon: DollarSign,  color: 'bg-primary/10 text-primary',    highlight: true },
    { label: 'LLM Cost',             value: inr4(costKpis.llmCost),            icon: Brain,       color: 'bg-violet-100 text-violet-700', highlight: false },
    { label: 'STT Cost',             value: inr4(costKpis.sttCost),            icon: AudioLines,  color: 'bg-sky-100 text-sky-700',       highlight: false },
    { label: 'TTS Cost',             value: inr4(costKpis.ttsCost),            icon: Volume2,     color: 'bg-teal-100 text-teal-700',     highlight: false },
    { label: 'Telephony Cost',       value: inr4(costKpis.telephonyCost),      icon: Phone,       color: 'bg-blue-100 text-blue-700',     highlight: false },
    { label: 'Cost per Call',        value: inr4(costKpis.costPerCall),       icon: TrendingUp,  color: 'bg-amber-100 text-amber-700',   highlight: false },
    { label: 'Cost per Minute',      value: inr4(costKpis.costPerMinute),     icon: TrendingUp,  color: 'bg-orange-100 text-orange-700', highlight: false },
    { label: 'Cost / Successful Call', value: inr4(costKpis.costPerSuccessfulCall), icon: DollarSign, color: 'bg-emerald-100 text-emerald-700', highlight: false },
  ]

  // Service composition for the donut
  const serviceSegments = [
    { label: 'LLM',       value: costKpis.llmCost,       color: SERVICE_COLORS.llm },
    { label: 'STT',       value: costKpis.sttCost,       color: SERVICE_COLORS.stt },
    { label: 'TTS',       value: costKpis.ttsCost,       color: SERVICE_COLORS.tts },
    { label: 'Telephony', value: costKpis.telephonyCost, color: SERVICE_COLORS.telephony },
  ]

  // Trend summary (full period)
  const periodTotal = costTimeSeries.reduce((s, d) => s + d.llm + d.stt + d.tts + d.telephony, 0)
  const periodAvg = periodTotal / (costTimeSeries.length || 1)
  const peakDay = costTimeSeries.length
    ? costTimeSeries.reduce((m, d) => (d.llm + d.stt + d.tts + d.telephony) > (m.llm + m.stt + m.tts + m.telephony) ? d : m, costTimeSeries[0])
    : null

  // Ranked agents + campaigns
  const rankedAgents = [...costByAgent].sort((a, b) => b.totalCost - a.totalCost)
  const maxAgentCost = Math.max(...costByAgent.map(a => a.totalCost), 1)
  const rankedCampaigns = [...costByCampaign].sort((a, b) => b.totalCost - a.totalCost)
  const maxCampaignCost = Math.max(...costByCampaign.map(c => c.totalCost), 1)

  // Provider breakdown items (actual usage + usage metric per service)
  const llmItems = llmCostBreakdown.map(p => ({ provider: p.provider, costUsd: p.costUsd, pct: p.pct, usageLabel: `${(p.tokens / 1_000_000).toFixed(1)}M tokens` }))
  const sttItems = sttCostBreakdown.map(p => ({ provider: p.provider, costUsd: p.costUsd, pct: p.pct, usageLabel: `${fmt(p.minutes)} minutes processed` }))
  const ttsItems = ttsCostBreakdown.map(p => ({ provider: p.provider, costUsd: p.costUsd, pct: p.pct, usageLabel: `${(p.chars / 1_000_000).toFixed(1)}M characters generated` }))
  const telItems = telephonyCostBreakdown.map(p => ({ provider: p.provider, costUsd: p.costUsd, pct: p.pct, usageLabel: `${fmt(p.minutes)} call minutes` }))

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cost Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Actual AI service usage and incurred cost for this organization —{' '}
            <span className="inline-flex items-center gap-1 text-amber-700">
              <AlertTriangle className="h-3 w-3" /> All values are estimated dummy data
            </span>
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
          <Select value={serviceFilter} onValueChange={(v) => v && setServiceFilter(v)}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              <SelectItem value="llm">LLM only</SelectItem>
              <SelectItem value="stt">STT only</SelectItem>
              <SelectItem value="tts">TTS only</SelectItem>
              <SelectItem value="telephony">Telephony only</SelectItem>
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
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Download className="h-3.5 w-3.5" /> Export</Button>
        </div>
      </div>

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={cn('rounded-lg border bg-card p-4 flex flex-col gap-2', k.highlight ? 'border-primary/30' : 'border-border')}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', k.color)}><k.icon className="h-3.5 w-3.5" /></div>
            </div>
            <span className={cn('text-2xl font-semibold tabular-nums', k.highlight && 'text-primary')}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* 2. Cost Trends Over Time — stacked area */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Cost Trends Over Time</h3>
            <p className="text-xs text-muted-foreground">Daily actual cost by service (INR)</p>
          </div>
        </div>
        <StackedCostChart data={costTimeSeries} />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Total period cost</p>
            <p className="text-sm font-semibold tabular-nums">{inr(periodTotal)}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Average / day</p>
            <p className="text-sm font-semibold tabular-nums">{inr(periodAvg)}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Peak day</p>
            <p className="text-sm font-semibold tabular-nums">{peakDay ? `${inr(peakDay.llm + peakDay.stt + peakDay.tts + peakDay.telephony)} · ${peakDay.day}` : '—'}</p>
          </div>
        </div>
      </div>

      {/* 3. Cost Distribution by Service — donut */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Cost Distribution by Service</h3>
          <p className="text-xs text-muted-foreground">Where this organization's spend goes across AI services</p>
        </div>
        <div className="flex items-center gap-8 flex-wrap">
          <CostDonut segments={serviceSegments} total={costKpis.totalEstimatedCost} />
          <div className="flex flex-col gap-3 flex-1 min-w-[220px]">
            {serviceSegments.map(s => {
              const p = costKpis.totalEstimatedCost > 0 ? (s.value / costKpis.totalEstimatedCost) * 100 : 0
              return (
                <div key={s.label} className="flex items-center gap-3 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-foreground flex-1">{s.label}</span>
                  <span className="text-muted-foreground tabular-nums">{inr(s.value)}</span>
                  <span className="w-12 text-right font-medium tabular-nums">{p.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. Cost by AI Agent — ranked stacked bars + table */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold">Cost by AI Agent</h3>
            <p className="text-xs text-muted-foreground">Ranked by total cost, with per-service composition</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {COST_SERIES.map(s => (
              <span key={s.key} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: SERVICE_COLORS[s.key] }} />{s.label}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {rankedAgents.map(a => (
            <div key={a.agent}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="truncate max-w-[180px] font-medium">{a.agent}</span>
                <span className="font-semibold tabular-nums">{inr(a.totalCost)}</span>
              </div>
              <div className="flex h-2.5 w-full rounded-full bg-muted overflow-hidden">
                {(['llm', 'stt', 'tts', 'telephony'] as const).map(k => a[k] > 0 && (
                  <div key={k} style={{ width: `${(a[k] / maxAgentCost) * 100}%`, backgroundColor: SERVICE_COLORS[k] }} title={`${k}: ${inr(a[k])}`} />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>{fmt(a.calls)} calls</span>
                <span>{inr4(a.totalCost / (a.calls || 1))} / call</span>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Agent', 'Total', 'LLM', 'STT', 'TTS', 'Telephony', 'Calls', 'Cost/Call'].map(h => (
                  <th key={h} className="pb-2 text-left font-medium text-muted-foreground pr-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankedAgents.map(a => (
                <tr key={a.agent} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 font-medium pr-3 max-w-[160px] truncate">{a.agent}</td>
                  <td className="py-2.5 tabular-nums font-semibold pr-3">{inr(a.totalCost)}</td>
                  <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{inr(a.llm)}</td>
                  <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{inr(a.stt)}</td>
                  <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{inr(a.tts)}</td>
                  <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{inr(a.telephony)}</td>
                  <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{fmt(a.calls)}</td>
                  <td className="py-2.5 tabular-nums text-muted-foreground">{inr4(a.totalCost / (a.calls || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Cost by Campaign — ranked bars */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-1">Cost by Campaign</h3>
        <p className="text-xs text-muted-foreground mb-4">Ranked by total cost across outbound campaigns</p>
        <div className="flex flex-col gap-3">
          {rankedCampaigns.map(c => (
            <div key={c.campaign}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="truncate max-w-[220px]">{c.campaign}</span>
                <span className="font-semibold tabular-nums ml-2">{inr(c.totalCost)}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${(c.totalCost / maxCampaignCost) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>{fmt(c.calls)} calls</span>
                <span>{inr4(c.costPerCall)} / call</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Actual Provider Cost Breakdowns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProviderCostCard title="LLM Cost Breakdown" color={SERVICE_COLORS.llm} items={llmItems} />
        <ProviderCostCard title="STT Cost Breakdown" color={SERVICE_COLORS.stt} items={sttItems} />
        <ProviderCostCard title="TTS Cost Breakdown" color={SERVICE_COLORS.tts} items={ttsItems} />
        <ProviderCostCard title="Telephony Cost Breakdown" color={SERVICE_COLORS.telephony} items={telItems} />
      </div>

      {/* 7. Provider Usage Over Time */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-1">Provider Usage Over Time</h3>
        <p className="text-xs text-muted-foreground mb-4">Which provider was actually used during each period</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Period', 'LLM Provider', 'STT Provider', 'TTS Provider'].map(h => (
                  <th key={h} className="pb-2 text-left font-medium text-muted-foreground pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providerUsageTimeline.map(r => (
                <tr key={r.period} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 text-muted-foreground pr-4 whitespace-nowrap">{r.period}</td>
                  <td className="py-2.5 font-medium pr-4">{r.llm}</td>
                  <td className="py-2.5 font-medium pr-4">{r.stt}</td>
                  <td className="py-2.5 font-medium">{r.tts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}