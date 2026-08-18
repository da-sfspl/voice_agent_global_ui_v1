'use client'

import { useState } from 'react'
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
function usd(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function usd4(n: number) { return `$${n.toFixed(4)}` }

const maxCostDay = Math.max(...costTimeSeries.map(d => d.tts))

export function CostAnalytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')

  const kpis = [
    { label: 'Total Estimated Cost', value: usd(costKpis.totalEstimatedCost), icon: DollarSign,  color: 'bg-primary/10 text-primary',         highlight: true },
    { label: 'LLM Cost',             value: usd(costKpis.llmCost),            icon: Brain,       color: 'bg-violet-100 text-violet-700',      highlight: false },
    { label: 'STT Cost',             value: usd(costKpis.sttCost),            icon: AudioLines,  color: 'bg-sky-100 text-sky-700',            highlight: false },
    { label: 'TTS Cost',             value: usd(costKpis.ttsCost),            icon: Volume2,     color: 'bg-teal-100 text-teal-700',          highlight: false },
    { label: 'Telephony Cost',       value: usd(costKpis.telephonyCost),      icon: Phone,       color: 'bg-blue-100 text-blue-700',          highlight: false },
    { label: 'Cost per Call',        value: usd4(costKpis.costPerCall),       icon: TrendingUp,  color: 'bg-amber-100 text-amber-700',        highlight: false },
    { label: 'Cost per Minute',      value: usd4(costKpis.costPerMinute),     icon: TrendingUp,  color: 'bg-orange-100 text-orange-700',      highlight: false },
    { label: 'Cost / Successful Call',value: usd4(costKpis.costPerSuccessfulCall), icon: DollarSign, color: 'bg-emerald-100 text-emerald-700', highlight: false },
  ]

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cost Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Usage and cost visibility across all AI services —{' '}
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
          <div key={k.label} className={cn('rounded-lg border bg-card p-4 flex flex-col gap-2', k.highlight ? 'border-primary/30' : 'border-border')}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', k.color)}>
                <k.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className={cn('text-2xl font-semibold tabular-nums', k.highlight && 'text-primary')}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Cost Trends Chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Cost Trends Over Time</h3>
            <p className="text-xs text-muted-foreground">Daily estimated cost by service type (USD)</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-violet-500" />LLM</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-sky-500" />STT</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-teal-500" />TTS</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-500" />Telephony</span>
          </div>
        </div>
        <div className="flex h-40 items-end gap-0.5 overflow-hidden">
          {costTimeSeries.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center" style={{ height: '140px' }}>
              <div className="flex w-full items-end gap-px" style={{ height: '130px' }}>
                <div className="flex-1 rounded-sm bg-violet-500/70" style={{ height: `${(d.llm / maxCostDay) * 100}%` }} title={`LLM: $${d.llm}`} />
                <div className="flex-1 rounded-sm bg-sky-400/70" style={{ height: `${(d.stt / maxCostDay) * 100}%` }} title={`STT: $${d.stt}`} />
                <div className="flex-1 rounded-sm bg-teal-400/70" style={{ height: `${(d.tts / maxCostDay) * 100}%` }} title={`TTS: $${d.tts}`} />
                <div className="flex-1 rounded-sm bg-blue-400/70" style={{ height: `${(d.telephony / maxCostDay) * 100}%` }} title={`Tel: $${d.telephony}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>Jul 9</span><span>Jul 22</span><span>Aug 7</span>
        </div>
      </div>

      {/* Cost by Agent + Campaign */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* By Agent */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Cost by AI Agent</h3>
          <p className="text-xs text-muted-foreground mb-4">Estimated total cost per agent (30 days)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {['Agent','Total','LLM','STT','TTS','Telephony','Calls'].map(h => (
                    <th key={h} className="pb-2 text-left font-medium text-muted-foreground pr-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costByAgent.map((a) => (
                  <tr key={a.agent} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-medium pr-3 max-w-[140px] truncate">{a.agent}</td>
                    <td className="py-2.5 tabular-nums font-semibold pr-3">{usd(a.totalCost)}</td>
                    <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{usd(a.llm)}</td>
                    <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{usd(a.stt)}</td>
                    <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{usd(a.tts)}</td>
                    <td className="py-2.5 tabular-nums text-muted-foreground pr-3">{usd(a.telephony)}</td>
                    <td className="py-2.5 tabular-nums text-muted-foreground">{fmt(a.calls)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Campaign */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Cost by Campaign</h3>
          <p className="text-xs text-muted-foreground mb-4">Estimated cost per outbound campaign</p>
          <div className="flex flex-col gap-3">
            {costByCampaign.map((c) => {
              const maxCost = Math.max(...costByCampaign.map(x => x.totalCost))
              return (
                <div key={c.campaign}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="truncate max-w-[200px]">{c.campaign}</span>
                    <span className="font-semibold tabular-nums ml-2">{usd(c.totalCost)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${(c.totalCost / maxCost) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>{fmt(c.calls)} calls</span>
                    <span>{usd4(c.costPerCall)} / call</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Provider Cost Breakdowns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LLM */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">LLM Cost Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Cost and token usage by LLM provider/model</p>
          <div className="flex flex-col gap-2.5">
            {llmCostBreakdown.map((p) => (
              <div key={p.provider}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="truncate max-w-[200px]">{p.provider}</span>
                  <span className="font-semibold tabular-nums ml-2">{usd(p.costUsd)} ({p.pct}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500/70" style={{ width: `${p.pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{(p.tokens / 1_000_000).toFixed(1)}M tokens</p>
              </div>
            ))}
          </div>
        </div>

        {/* STT */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">STT Cost Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Cost and usage by STT provider/model</p>
          <div className="flex flex-col gap-2.5">
            {sttCostBreakdown.map((p) => (
              <div key={p.provider}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="truncate max-w-[200px]">{p.provider}</span>
                  <span className="font-semibold tabular-nums ml-2">{usd(p.costUsd)} ({p.pct}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500/70" style={{ width: `${p.pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{fmt(p.minutes)} minutes</p>
              </div>
            ))}
          </div>
        </div>

        {/* TTS */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">TTS Cost Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Cost and usage by TTS provider/model</p>
          <div className="flex flex-col gap-2.5">
            {ttsCostBreakdown.map((p) => (
              <div key={p.provider}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="truncate max-w-[200px]">{p.provider}</span>
                  <span className="font-semibold tabular-nums ml-2">{usd(p.costUsd)} ({p.pct}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-teal-500/70" style={{ width: `${p.pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{(p.chars / 1_000_000).toFixed(1)}M characters</p>
              </div>
            ))}
          </div>
        </div>

        {/* Telephony */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Telephony Cost Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Cost and usage by SIP/telephony provider</p>
          <div className="flex flex-col gap-2.5">
            {telephonyCostBreakdown.map((p) => (
              <div key={p.provider}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="truncate max-w-[200px]">{p.provider}</span>
                  <span className="font-semibold tabular-nums ml-2">{usd(p.costUsd)} ({p.pct}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500/70" style={{ width: `${p.pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{fmt(p.minutes)} minutes</p>
              </div>
            ))}
          </div>

          {/* Cost summary */}
          <div className="mt-5 rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">30-Day Cost Summary</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'LLM',       value: usd(costKpis.llmCost),       pct: ((costKpis.llmCost / costKpis.totalEstimatedCost) * 100).toFixed(1) },
                { label: 'STT',       value: usd(costKpis.sttCost),       pct: ((costKpis.sttCost / costKpis.totalEstimatedCost) * 100).toFixed(1) },
                { label: 'TTS',       value: usd(costKpis.ttsCost),       pct: ((costKpis.ttsCost / costKpis.totalEstimatedCost) * 100).toFixed(1) },
                { label: 'Telephony', value: usd(costKpis.telephonyCost), pct: ((costKpis.telephonyCost / costKpis.totalEstimatedCost) * 100).toFixed(1) },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium tabular-nums">{s.value} <span className="text-muted-foreground">({s.pct}%)</span></span>
                </div>
              ))}
              <div className="col-span-2 border-t border-border pt-2 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{usd(costKpis.totalEstimatedCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
