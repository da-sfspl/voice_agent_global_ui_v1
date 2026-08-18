'use client'

import { useState } from 'react'
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

export function AIPerformanceAnalytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [agentFilter, setAgentFilter] = useState('all')
  const [compareBy, setCompareBy] = useState('agent')

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
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-sky-500" />STT</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-violet-500" />LLM</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-teal-500" />TTS</span>
          </div>
        </div>
        <div className="flex h-40 items-end gap-0.5 overflow-hidden">
          {latencyTimeSeries.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-0.5" style={{ height: '140px' }}>
              <div className="flex w-full items-end gap-px" style={{ height: '130px' }}>
                <div className="flex-1 rounded-sm bg-sky-400/70" style={{ height: `${(d.stt / maxLatency) * 100}%` }} title={`STT: ${d.stt}ms`} />
                <div className="flex-1 rounded-sm bg-violet-500/70" style={{ height: `${(d.llm / maxLatency) * 100}%` }} title={`LLM: ${d.llm}ms`} />
                <div className="flex-1 rounded-sm bg-teal-400/70" style={{ height: `${(d.tts / maxLatency) * 100}%` }} title={`TTS: ${d.tts}ms`} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>Jul 9</span><span>Jul 22</span><span>Aug 7</span>
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
