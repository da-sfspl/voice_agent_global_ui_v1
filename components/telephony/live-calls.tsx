'use client'

import { useState } from 'react'
import { liveCalls, type LiveCall } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  PhoneIncoming, PhoneOutgoing, PhoneOff, Pause, Play, UserPlus,
  Mic, MicOff, Volume2, Activity, Clock, Bot, Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const directionIcon = {
  inbound:  { Icon: PhoneIncoming,  bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
  outbound: { Icon: PhoneOutgoing,  bg: 'bg-blue-500/10',    color: 'text-blue-500' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  'active':       { label: 'Active',       className: 'border-[var(--status-active)]/30 text-[var(--status-active)]' },
  'on-hold':      { label: 'On Hold',      className: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]' },
  'transferring': { label: 'Transferring', className: 'border-blue-500/30 text-blue-500' },
}

const sentimentConfig: Record<string, { label: string; color: string; dot: string }> = {
  positive: { label: 'Positive', color: 'text-[var(--status-active)]',   dot: 'bg-[var(--status-active)]' },
  neutral:  { label: 'Neutral',  color: 'text-muted-foreground',          dot: 'bg-muted-foreground' },
  negative: { label: 'Negative', color: 'text-destructive',               dot: 'bg-destructive' },
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function LiveCallsView() {
  const [selected, setSelected] = useState<LiveCall>(liveCalls[0])
  const [muted, setMuted] = useState(false)

  const activeCalls = liveCalls.filter((c) => c.status === 'active').length
  const onHold = liveCalls.filter((c) => c.status === 'on-hold').length
  const avgDur = Math.round(liveCalls.reduce((s, c) => s + c.durationSecs, 0) / liveCalls.length)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Live Calls</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor active calls in real-time, view live transcripts, and manage call controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-[var(--status-active)]">{liveCalls.length} live</span>
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Calls', value: activeCalls, icon: Radio, color: 'text-[var(--status-active)]' },
          { label: 'On Hold', value: onHold, icon: Pause, color: 'text-[var(--status-warning)]' },
          { label: 'Avg Duration', value: formatDuration(avgDur), icon: Clock, color: 'text-muted-foreground' },
          { label: 'Agents Busy', value: new Set(liveCalls.map((c) => c.agentId)).size, icon: Bot, color: 'text-primary' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={cn('h-4 w-4', s.color)} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-[320px_1fr] gap-4">
        {/* Call List */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Active Calls ({liveCalls.length})
          </p>
          {liveCalls.map((call) => {
            const dir = directionIcon[call.direction]
            const DirIcon = dir.Icon
            const sc = statusConfig[call.status]
            const sent = sentimentConfig[call.sentiment]
            const isSelected = selected.id === call.id
            return (
              <button
                key={call.id}
                onClick={() => setSelected(call)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors w-full',
                  isSelected
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-card hover:border-border/80 hover:bg-accent/30',
                )}
              >
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5', dir.bg)}>
                  <DirIcon className={cn('h-4 w-4', dir.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-mono font-medium truncate">{call.callerNumber}</p>
                    <span className="font-mono text-xs text-muted-foreground shrink-0">{formatDuration(call.durationSecs)}</span>
                  </div>
                  {call.callerName && (
                    <p className="text-xs text-muted-foreground truncate">{call.callerName}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{call.agentName}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', sc.className)}>
                      {sc.label}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className={cn('h-1.5 w-1.5 rounded-full', sent.dot)} />
                      <span className={cn('text-[10px]', sent.color)}>{sent.label}</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Call Detail Panel */}
        <CallDetailPanel call={selected} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
      </div>
    </div>
  )
}

function CallDetailPanel({ call, muted, onToggleMute }: { call: LiveCall; muted: boolean; onToggleMute: () => void }) {
  const dir = directionIcon[call.direction]
  const DirIcon = dir.Icon
  const sc = statusConfig[call.status]
  const sent = sentimentConfig[call.sentiment]

  return (
    <div className="flex flex-col gap-4">
      {/* Caller Info */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', dir.bg)}>
              <DirIcon className={cn('h-5 w-5', dir.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold font-mono">{call.callerNumber}</p>
                {call.callerName && (
                  <span className="text-sm text-muted-foreground">· {call.callerName}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className={cn('text-xs', sc.className)}>{sc.label}</Badge>
                <span className="text-xs text-muted-foreground capitalize">{call.direction}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{call.sipProvider}</span>
                {call.liveKitRoom && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-mono text-muted-foreground">{call.liveKitRoom}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-end">
              <span className="font-mono text-lg font-semibold tabular-nums">{formatDuration(call.durationSecs)}</span>
              <span className="text-xs text-muted-foreground">duration</span>
            </div>
          </div>
        </div>

        {/* Agent + Sentiment row */}
        <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-muted/40 p-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">AI Agent</p>
            <div className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium">{call.agentName}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sentiment</p>
            <div className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', sent.dot)} />
              <span className={cn('text-sm font-medium', sent.color)}>{sent.label}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Trunk</p>
            <span className="text-sm font-medium font-mono">{call.trunkId}</span>
          </div>
        </div>

        {/* Call Controls */}
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={onToggleMute}
          >
            {muted ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
            {muted ? 'Unmute' : 'Mute'}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Pause className="h-4 w-4" />
            Hold
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            Transfer
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Volume2 className="h-4 w-4" />
            Listen In
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Activity className="h-4 w-4" />
            Whisper
          </Button>
          <Button size="sm" variant="destructive" className="gap-1.5 ml-auto">
            <PhoneOff className="h-4 w-4" />
            End Call
          </Button>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="rounded-lg border border-border bg-card p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">Live Transcript</h2>
            <p className="text-xs text-muted-foreground">Real-time speech-to-text via {call.sipProvider}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-[var(--status-active)] font-medium">Live</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
          {call.transcript.map((line, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2.5',
                line.speaker === 'agent' ? 'flex-row' : 'flex-row-reverse',
              )}
            >
              <div className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5',
                line.speaker === 'agent'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}>
                {line.speaker === 'agent' ? 'AI' : 'C'}
              </div>
              <div className={cn(
                'flex flex-col gap-0.5 max-w-[80%]',
                line.speaker !== 'agent' && 'items-end',
              )}>
                <div className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  line.speaker === 'agent'
                    ? 'bg-primary/10 text-foreground'
                    : 'bg-muted text-foreground',
                )}>
                  {line.text}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{line.ts}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <div className="flex gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
              AI
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
