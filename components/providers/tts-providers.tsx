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
import { cn } from '@/lib/utils'
import {
  Plus, CheckCircle2, XCircle, Zap, Volume2, Settings2, ChevronUp, ChevronDown,
  Loader2, AlertTriangle, Eye, EyeOff, Info, Lock, Globe, AudioLines, Sparkles,
  Gauge, SlidersHorizontal, Mic, Radio
} from 'lucide-react'

// ─── Provider Capability Metadata (READ-ONLY, predefined per provider) ──────
type ProviderCapabilities = {
  streaming: boolean
  multilingualVoices: boolean
  voiceCloning: boolean
  emotionStyleControl: boolean
  speedControl: boolean
  pitchControl: boolean
  loudnessControl: boolean
  expressivenessControl: boolean
  lowLatencyGeneration: boolean
}

const capabilityLabels: Record<keyof ProviderCapabilities, { label: string; icon: React.ElementType }> = {
  streaming:              { label: 'Streaming',                    icon: Radio },
  multilingualVoices:     { label: 'Multilingual Voices',          icon: Globe },
  voiceCloning:           { label: 'Voice Cloning',                icon: Mic },
  emotionStyleControl:    { label: 'Emotion / Style Control',      icon: Sparkles },
  speedControl:           { label: 'Speed Control',                icon: Gauge },
  pitchControl:           { label: 'Pitch Control',                icon: SlidersHorizontal },
  loudnessControl:        { label: 'Loudness / Volume Control',    icon: Volume2 },
  expressivenessControl:  { label: 'Expressiveness Control',       icon: AudioLines },
  lowLatencyGeneration:   { label: 'Low-latency Voice Generation', icon: Zap },
}

const providerCapabilities: Record<string, ProviderCapabilities> = {
  elevenlabs: {
    streaming: true, multilingualVoices: true, voiceCloning: true,
    emotionStyleControl: true, speedControl: true, pitchControl: false,
    loudnessControl: false, expressivenessControl: true, lowLatencyGeneration: true,
  },
  cartesia: {
    streaming: true, multilingualVoices: false, voiceCloning: false,
    emotionStyleControl: true, speedControl: true, pitchControl: true,
    loudnessControl: true, expressivenessControl: false, lowLatencyGeneration: true,
  },
  azure: {
    streaming: true, multilingualVoices: true, voiceCloning: false,
    emotionStyleControl: true, speedControl: true, pitchControl: true,
    loudnessControl: true, expressivenessControl: false, lowLatencyGeneration: false,
  },
  google: {
    streaming: true, multilingualVoices: true, voiceCloning: false,
    emotionStyleControl: false, speedControl: true, pitchControl: true,
    loudnessControl: true, expressivenessControl: false, lowLatencyGeneration: false,
  },
  aws: {
    streaming: true, multilingualVoices: true, voiceCloning: false,
    emotionStyleControl: false, speedControl: true, pitchControl: true,
    loudnessControl: true, expressivenessControl: false, lowLatencyGeneration: false,
  },
  deepgram: {
    streaming: true, multilingualVoices: false, voiceCloning: true,
    emotionStyleControl: false, speedControl: true, pitchControl: false,
    loudnessControl: false, expressivenessControl: false, lowLatencyGeneration: true,
  },
}

const supportedAudioFormats: Record<string, string[]> = {
  elevenlabs: ['mp3', 'pcm', 'ulaw'],
  cartesia:   ['pcm', 'mulaw', 'wav'],
  azure:      ['mp3', 'ogg', 'wav', 'pcm'],
  google:     ['mp3', 'ogg', 'wav', 'pcm', 'mulaw'],
  aws:        ['mp3', 'ogg', 'pcm', 'json'],
  deepgram:   ['mp3', 'wav', 'pcm', 'mulaw', 'flac'],
}

const statusCfg: Record<string, { label: string; className: string }> = {
  active:   { label: 'Active',   className: 'border-[var(--status-active)]/30 text-[var(--status-active)]' },
  inactive: { label: 'Inactive', className: 'border-border text-muted-foreground' },
  error:    { label: 'Error',    className: 'border-destructive/30 text-destructive' },
}

// ─── Main Component ─────────────────────────────────────────────────────────
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

// ─── TTSCard (unchanged) ────────────────────────────────────────────────────
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
  const caps = providerCapabilities[p.id] ?? providerCapabilities.elevenlabs

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

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <CapBadge label="Streaming" on={caps.streaming} />
            <CapBadge label="Voice Clone" on={caps.voiceCloning} />
            <CapBadge label="Emotion" on={caps.emotionStyleControl} />
            <CapBadge label="Low-latency" on={caps.lowLatencyGeneration} />
            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">
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

// ─── Capability Badge ───────────────────────────────────────────────────────
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

// ─── Test Button (unchanged) ────────────────────────────────────────────────
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

// ─── Edit Dialog (EXPANDED) ─────────────────────────────────────────────────
function EditTTSDialog({
  provider, onClose, onSave,
}: {
  provider: TTSProvider
  onClose: () => void
  onSave: (p: TTSProvider) => void
}) {
  const [form, setForm] = useState({ ...provider })
  const [showKey, setShowKey] = useState(false)

  // Load predefined capabilities for this provider (READ-ONLY)
  const capabilities = providerCapabilities[provider.id] ?? providerCapabilities.elevenlabs
  const formats = supportedAudioFormats[provider.id] ?? ['mp3', 'pcm']

  function set<K extends keyof TTSProvider>(k: K, v: TTSProvider[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configure {provider.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto pr-1">

          {/* ─── Provider Connection ─────────────────────────────────────── */}
          <Section label="Provider Connection">
            <div className="grid grid-cols-2 gap-3">
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
              <div className="flex flex-col gap-1.5">
                <Label>Base URL / Endpoint</Label>
                <Input
                  value={(form as any).baseUrl ?? `https://api.${provider.id}.com/v1`}
                  onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                  className="font-mono text-xs"
                  placeholder="https://api.provider.com/v1"
                />
              </div>
            </div>
          </Section>

          <Separator />

          {/* ─── Voice Configuration ─────────────────────────────────────── */}
          <Section label="Voice Configuration">
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

            {/* Voice capability support indicators */}
            <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                Voice Control Support (determined by provider)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <SupportIndicator label="Speed" supported={capabilities.speedControl} />
                <SupportIndicator label="Pitch" supported={capabilities.pitchControl} />
                <SupportIndicator label="Loudness" supported={capabilities.loudnessControl} />
                <SupportIndicator label="Expressiveness" supported={capabilities.expressivenessControl} />
                <SupportIndicator label="Voice Cloning" supported={capabilities.voiceCloning} />
                <SupportIndicator label="Emotion/Style" supported={capabilities.emotionStyleControl} />
              </div>
            </div>
          </Section>

          <Separator />

          {/* ─── Audio Configuration ─────────────────────────────────────── */}
          <Section label="Audio Configuration">
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
                  disabled={!capabilities.pitchControl}
                />
                {!capabilities.pitchControl && (
                  <p className="text-[10px] text-muted-foreground italic">Not supported by {provider.name}</p>
                )}
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
                <Select value={form.audioFormat} onValueChange={(v) => v && set('audioFormat', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {formats.map((f) => (
                      <SelectItem key={f} value={f} className="font-mono text-xs">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Streaming & Low-latency */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Streaming</p>
                  <p className="text-xs text-muted-foreground">Stream audio chunks as synthesized</p>
                </div>
                <Switch checked={form.streaming} onCheckedChange={(v) => set('streaming', v)} />
              </div>
              <div className={cn(
                'flex items-center justify-between rounded-md border px-3 py-2.5',
                capabilities.lowLatencyGeneration ? 'border-border' : 'border-border/50 opacity-50',
              )}>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    Low-latency Mode
                    {!capabilities.lowLatencyGeneration && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {capabilities.lowLatencyGeneration ? 'Real-time streaming enabled' : 'Not supported by provider'}
                  </p>
                </div>
                <Switch
                  checked={capabilities.lowLatencyGeneration}
                  disabled={!capabilities.lowLatencyGeneration}
                />
              </div>
            </div>

            {/* Supported formats display */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground">Supported formats:</span>
              {formats.map((f) => (
                <Badge key={f} variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">{f}</Badge>
              ))}
            </div>
          </Section>

          <Separator />

          {/* ─── Provider Capabilities (READ-ONLY) ───────────────────────── */}
          <Section label="Provider Capabilities">
            <div className="rounded-md border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  These capabilities are defined by the provider and cannot be modified.
                  They control which voice settings are available during Agent Creation.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(capabilityLabels) as [keyof ProviderCapabilities, { label: string; icon: React.ElementType }][]).map(([key, { label, icon: Icon }]) => {
                  const supported = capabilities[key]
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-3 py-2',
                        supported
                          ? 'border-[var(--status-active)]/25 bg-[var(--status-active)]/5'
                          : 'border-border bg-muted/20 opacity-60',
                      )}
                    >
                      <Icon className={cn('h-3.5 w-3.5 shrink-0', supported ? 'text-[var(--status-active)]' : 'text-muted-foreground')} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-[11px] font-medium truncate', supported ? 'text-foreground' : 'text-muted-foreground')}>
                          {label}
                        </p>
                      </div>
                      {supported ? (
                        <CheckCircle2 className="h-3 w-3 text-[var(--status-active)] shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Relationship note */}
              <div className="mt-3 rounded-md border border-border bg-card p-3">
                <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    These capabilities determine which fields are enabled in <strong>Agent Creation → Voice Settings</strong>.
                    For example, if <em>Pitch Control</em> is not supported, the pitch slider will be disabled for agents using this provider.
                  </span>
                </p>
              </div>
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

// ─── Support Indicator (small inline badge) ─────────────────────────────────
function SupportIndicator({ label, supported }: { label: string; supported: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 text-[11px]',
      supported ? 'text-foreground' : 'text-muted-foreground opacity-60',
    )}>
      {supported ? (
        <CheckCircle2 className="h-3 w-3 text-[var(--status-active)]" />
      ) : (
        <XCircle className="h-3 w-3 text-muted-foreground" />
      )}
      <span>{label}</span>
    </div>
  )
}

// ─── Section helper (unchanged) ─────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}