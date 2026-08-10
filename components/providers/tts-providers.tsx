'use client'

import { useState } from 'react'
import { ttsProviders, type TTSProvider, type TestState } from '@/lib/providers-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Volume2, Plus, Settings2, Zap, CheckCircle2, XCircle, Loader2,
  AlertTriangle, ChevronUp, ChevronDown, Eye, EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusCfg: Record<string, { label: string; className: string }> = {
  active:   { label: 'Active',   className: 'border-[var(--status-active)]/30 text-[var(--status-active)]' },
  inactive: { label: 'Inactive', className: 'border-border text-muted-foreground' },
  error:    { label: 'Error',    className: 'border-destructive/30 text-destructive' },
}

export function TTSProviders() {
  const [providers, setProviders] = useState<TTSProvider[]>(ttsProviders)
  const [editTarget, setEditTarget] = useState<TTSProvider | null>(null)
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

  function saveEdit(updated: TTSProvider) {
    setProviders((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    setEditTarget(null)
  }

  const sorted = [...providers].sort((a, b) => a.priority - b.priority)

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">TTS Providers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure text-to-speech providers, voices, and audio synthesis settings.
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
          { label: 'Streaming TTS',    value: streamingCnt,         icon: Volume2,      color: 'text-primary' },
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
          <TTSCard
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
        <EditTTSDialog
          provider={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  )
}

function TTSCard({
  provider: p, isFirst, isLast, testState, onToggle, onMoveUp, onMoveDown, onTest, onEdit,
}: {
  provider: TTSProvider
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
        {/* Priority */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <button onClick={onMoveUp} disabled={isFirst} className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent disabled:opacity-30 transition-colors">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground w-5 text-center">{p.priority}</span>
          <button onClick={onMoveDown} disabled={isLast} className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent disabled:opacity-30 transition-colors">
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
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="font-mono">{p.model}</span>
            {' · '}
            <span className="font-semibold text-foreground/70">{p.voice}</span>
            {' · '}
            <span>{p.language}</span>
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {[
              { label: 'Speed',       value: `${p.speed}×` },
              { label: 'Sample Rate', value: `${p.sampleRate} Hz` },
              { label: 'Format',      value: p.audioFormat },
              { label: 'Emotion',     value: p.emotion },
              { label: 'Latency',     value: `${p.latencyMs}ms` },
              { label: 'Cost',        value: `$${p.costPer1kChars}/1k` },
            ].map((m) => (
              <span key={m.label} className="text-[11px] text-muted-foreground">
                <span className="text-foreground/60">{m.label}:</span> {m.value}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <CapBadge label="Streaming" on={p.streaming} />
            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[240px]">
              ID: {p.voiceId}
            </span>
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
  if (state === 'testing') return (
    <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs" disabled>
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing…
    </Button>
  )
  if (state === 'success') return (
    <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs border-[var(--status-active)]/40 text-[var(--status-active)]" onClick={onTest}>
      <CheckCircle2 className="h-3.5 w-3.5" /> Connected
    </Button>
  )
  if (state === 'error') return (
    <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs border-destructive/40 text-destructive" onClick={onTest}>
      <AlertTriangle className="h-3.5 w-3.5" /> Retry
    </Button>
  )
  return (
    <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs" onClick={onTest}>
      <Zap className="h-3.5 w-3.5" /> Test
    </Button>
  )
}

function EditTTSDialog({
  provider, onClose, onSave,
}: {
  provider: TTSProvider
  onClose: () => void
  onSave: (p: TTSProvider) => void
}) {
  const [form, setForm] = useState({ ...provider })
  const [showKey, setShowKey] = useState(false)

  function set<K extends keyof TTSProvider>(k: K, v: TTSProvider[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {provider.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
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

          <Section label="Voice Settings">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Model</Label>
                <Input value={form.model} onChange={(e) => set('model', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Voice Name</Label>
                <Input value={form.voice} onChange={(e) => set('voice', e.target.value)} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Voice ID</Label>
                <Input value={form.voiceId} onChange={(e) => set('voiceId', e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Language</Label>
                <Input value={form.language} onChange={(e) => set('language', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Emotion / Style</Label>
                <Select value={form.emotion} onValueChange={(v) => v && set('emotion', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['neutral', 'cheerful', 'sad', 'angry', 'excited', 'friendly', 'professional'].map((e) => (
                      <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <Separator />

          <Section label="Audio Settings">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Speed ({form.speed}×)</Label>
                <input
                  type="range" min={0.5} max={2} step={0.1}
                  value={form.speed}
                  onChange={(e) => set('speed', parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Pitch ({form.pitch})</Label>
                <input
                  type="range" min={-20} max={20} step={1}
                  value={form.pitch}
                  onChange={(e) => set('pitch', parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Sample Rate (Hz)</Label>
                <Select value={String(form.sampleRate)} onValueChange={(v) => v && set('sampleRate', parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['8000', '16000', '22050', '24000', '44100', '48000'].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Audio Format</Label>
                <Input value={form.audioFormat} onChange={(e) => set('audioFormat', e.target.value)} />
              </div>
            </div>
          </Section>

          <Separator />

          <Section label="Capabilities">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Streaming</p>
                <p className="text-xs text-muted-foreground">Stream audio chunks as they are synthesized.</p>
              </div>
              <Switch checked={form.streaming} onCheckedChange={(v) => set('streaming', v)} />
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
