'use client'

import { useState } from 'react'
import { llmProviders, type LLMProvider, type TestState } from '@/lib/providers-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Brain, Plus, Settings2, Zap, CheckCircle2, XCircle, Loader2,
  AlertTriangle, ChevronUp, ChevronDown, Eye, EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusCfg: Record<string, { label: string; className: string }> = {
  active:   { label: 'Active',   className: 'border-[var(--status-active)]/30 text-[var(--status-active)]' },
  inactive: { label: 'Inactive', className: 'border-border text-muted-foreground' },
  error:    { label: 'Error',    className: 'border-destructive/30 text-destructive' },
}

export function LLMProviders() {
  const [providers, setProviders] = useState<LLMProvider[]>(llmProviders)
  const [editTarget, setEditTarget] = useState<LLMProvider | null>(null)
  const [testStates, setTestStates] = useState<Record<string, TestState>>({})

  const activeCount  = providers.filter((p) => p.status === 'active').length
  const avgLatency   = Math.round(providers.filter((p) => p.status === 'active').reduce((s, p) => s + p.latencyMs, 0) / (activeCount || 1))
  const streamingCnt = providers.filter((p) => p.streaming && p.status === 'active').length

  function toggleStatus(id: string) {
    setProviders((prev) =>
      prev.map((p) => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p)
    )
  }

  function movePriority(id: string, dir: -1 | 1) {
    setProviders((prev) => {
      const sorted = [...prev].sort((a, b) => a.priority - b.priority)
      const idx = sorted.findIndex((p) => p.id === id)
      const swapIdx = idx + dir
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev
      const next = sorted.map((p) => ({ ...p }))
      const tmp = next[idx].priority
      next[idx].priority = next[swapIdx].priority
      next[swapIdx].priority = tmp
      return next
    })
  }

  function testConnection(id: string) {
    setTestStates((s) => ({ ...s, [id]: 'testing' }))
    setTimeout(() => {
      setTestStates((s) => ({ ...s, [id]: Math.random() > 0.2 ? 'success' : 'error' }))
    }, 1800)
  }

  function saveEdit(updated: LLMProvider) {
    setProviders((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    setEditTarget(null)
  }

  const sorted = [...providers].sort((a, b) => a.priority - b.priority)

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">LLM Providers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure large language model providers, model parameters, and priority order.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Provider
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Providers', value: activeCount,          icon: CheckCircle2, color: 'text-[var(--status-active)]' },
          { label: 'Avg Latency',      value: `${avgLatency} ms`,   icon: Zap,          color: 'text-[var(--status-warning)]' },
          { label: 'Streaming',        value: streamingCnt,         icon: Brain,        color: 'text-primary' },
          { label: 'Total Configured', value: providers.length,     icon: Settings2,    color: 'text-muted-foreground' },
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

      {/* Provider Cards */}
      <div className="flex flex-col gap-3">
        {sorted.map((p, idx) => (
          <ProviderCard
            key={p.id}
            provider={p}
            isFirst={idx === 0}
            isLast={idx === sorted.length - 1}
            testState={testStates[p.id] ?? 'idle'}
            onToggle={() => toggleStatus(p.id)}
            onMoveUp={() => movePriority(p.id, -1)}
            onMoveDown={() => movePriority(p.id, 1)}
            onTest={() => testConnection(p.id)}
            onEdit={() => setEditTarget(p)}
          />
        ))}
      </div>

      {editTarget && (
        <EditLLMDialog
          provider={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  )
}

function ProviderCard({
  provider: p, isFirst, isLast, testState, onToggle, onMoveUp, onMoveDown, onTest, onEdit,
}: {
  provider: LLMProvider
  isFirst: boolean
  isLast: boolean
  testState: TestState
  onToggle: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onTest: () => void
  onEdit: () => void
}) {
  const sc = statusCfg[p.status]
  const isActive = p.status === 'active'

  return (
    <div className={cn(
      'rounded-lg border bg-card p-5 transition-colors',
      isActive ? 'border-border' : 'border-border/50 opacity-70',
    )}>
      <div className="flex items-start gap-4">
        {/* Priority controls */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground w-5 text-center">
            {p.priority}
          </span>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-xl">
          {p.logo}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{p.name}</span>
            <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
            {p.priority === 1 && (
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">Primary</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground font-mono">{p.model}</p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {[
              { label: 'Temp', value: p.temperature },
              { label: 'Max Tokens', value: p.maxTokens.toLocaleString() },
              { label: 'Top-P', value: p.topP },
              { label: 'Context', value: `${(p.contextWindow / 1000).toFixed(0)}k` },
              { label: 'Latency', value: `${p.latencyMs}ms` },
              { label: 'Cost', value: `$${p.costPer1kTokens}/1k` },
            ].map((m) => (
              <span key={m.label} className="text-[11px] text-muted-foreground">
                <span className="text-foreground/60">{m.label}:</span> {m.value}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <CapBadge label="Streaming" on={p.streaming} />
            <CapBadge label="Tool Calling" on={p.toolCalling} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <TestButton state={testState} onTest={onTest} />
          <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs" onClick={onEdit}>
            <Settings2 className="h-3.5 w-3.5" /> Configure
          </Button>
          <Switch checked={isActive} onCheckedChange={onToggle} />
        </div>
      </div>
    </div>
  )
}

function CapBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
      on ? 'border-[var(--status-active)]/30 text-[var(--status-active)]' : 'border-border text-muted-foreground',
    )}>
      {on ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
      {label}
    </span>
  )
}

function TestButton({ state, onTest }: { state: TestState; onTest: () => void }) {
  if (state === 'testing') {
    return (
      <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs" disabled>
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing…
      </Button>
    )
  }
  if (state === 'success') {
    return (
      <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs border-[var(--status-active)]/40 text-[var(--status-active)]" onClick={onTest}>
        <CheckCircle2 className="h-3.5 w-3.5" /> Connected
      </Button>
    )
  }
  if (state === 'error') {
    return (
      <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs border-destructive/40 text-destructive" onClick={onTest}>
        <AlertTriangle className="h-3.5 w-3.5" /> Retry
      </Button>
    )
  }
  return (
    <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs" onClick={onTest}>
      <Zap className="h-3.5 w-3.5" /> Test
    </Button>
  )
}

function EditLLMDialog({
  provider, onClose, onSave,
}: {
  provider: LLMProvider
  onClose: () => void
  onSave: (p: LLMProvider) => void
}) {
  const [form, setForm] = useState({ ...provider })
  const [showKey, setShowKey] = useState(false)

  function set<K extends keyof LLMProvider>(k: K, v: LLMProvider[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {provider.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* API */}
          <Section label="Authentication">
            <div className="flex flex-col gap-1.5">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={form.apiKey}
                  onChange={(e) => set('apiKey', e.target.value)}
                  className="font-mono text-xs"
                />
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => setShowKey((v) => !v)}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Section>

          <Separator />

          {/* Model */}
          <Section label="Model Settings">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Model</Label>
                <Input value={form.model} onChange={(e) => set('model', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Temperature ({form.temperature})</Label>
                <input
                  type="range" min={0} max={2} step={0.1}
                  value={form.temperature}
                  onChange={(e) => set('temperature', parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Max Tokens</Label>
                <Input type="number" value={form.maxTokens} onChange={(e) => set('maxTokens', parseInt(e.target.value))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Top-P ({form.topP})</Label>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={form.topP}
                  onChange={(e) => set('topP', parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </Section>

          <Separator />

          {/* System Prompt */}
          <Section label="System Prompt">
            <Textarea
              rows={4}
              value={form.systemPrompt}
              onChange={(e) => set('systemPrompt', e.target.value)}
              placeholder="System prompt for this provider…"
            />
          </Section>

          <Separator />

          {/* Capabilities */}
          <Section label="Capabilities">
            <div className="flex flex-col gap-3">
              {([
                { key: 'streaming' as const,    label: 'Streaming',     desc: 'Stream tokens as they are generated.' },
                { key: 'toolCalling' as const,  label: 'Tool Calling',  desc: 'Enable function/tool calling support.' },
              ]).map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={form[item.key] as boolean}
                    onCheckedChange={(v) => set(item.key, v)}
                  />
                </div>
              ))}
            </div>
          </Section>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}
