'use client'

import { useState } from 'react'
import {
  routingConfig, llmProviders, sttProviders, ttsProviders,
  type RoutingChain, type RoutingConfig,
} from '@/lib/providers-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Brain, Mic, Volume2, ArrowDown, CheckCircle2, AlertTriangle,
  ShieldCheck, Zap, RefreshCw, Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ProviderType = 'llm' | 'stt' | 'tts'

const FAILURE_CONDITIONS = [
  { key: 'timeout',         label: 'Timeout' },
  { key: 'rate_limit',      label: 'Rate Limit' },
  { key: 'server_error',    label: 'Server Error (5xx)' },
  { key: 'auth_error',      label: 'Auth Error (401/403)' },
  { key: 'voice_not_found', label: 'Voice Not Found' },
  { key: 'model_not_found', label: 'Model Not Found' },
]

const providerMap = {
  llm: llmProviders,
  stt: sttProviders,
  tts: ttsProviders,
}

const sectionMeta: Record<ProviderType, { label: string; icon: React.ElementType; color: string }> = {
  llm: { label: 'LLM',          icon: Brain,   color: 'text-violet-500' },
  stt: { label: 'Speech-to-Text', icon: Mic,   color: 'text-blue-500' },
  tts: { label: 'Text-to-Speech', icon: Volume2, color: 'text-emerald-500' },
}

export function RoutingFallback() {
  const [config, setConfig] = useState<RoutingConfig>(routingConfig)
  const [saved, setSaved] = useState(false)

  function updateChain(type: ProviderType, patch: Partial<RoutingChain>) {
    setConfig((c) => ({ ...c, [type]: { ...c[type], ...patch } }))
    setSaved(false)
  }

  function toggleCondition(type: ProviderType, condition: string) {
    const current = config[type].failureConditions
    const next = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition]
    updateChain(type, { failureConditions: next })
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const activeProviders = {
    llm: llmProviders.filter((p) => p.status === 'active').length,
    stt: sttProviders.filter((p) => p.status === 'active').length,
    tts: ttsProviders.filter((p) => p.status === 'active').length,
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Routing & Fallback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define provider priority chains and automatic failover rules for LLM, STT, and TTS.
          </p>
        </div>
        <Button size="sm" className={cn('gap-1.5', saved && 'border-[var(--status-active)]/40 text-[var(--status-active)]')} variant={saved ? 'outline' : 'default'} onClick={handleSave}>
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved' : 'Save Config'}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active LLM',  value: activeProviders.llm, icon: Brain,    color: 'text-violet-500' },
          { label: 'Active STT',  value: activeProviders.stt, icon: Mic,      color: 'text-blue-500' },
          { label: 'Active TTS',  value: activeProviders.tts, icon: Volume2,  color: 'text-emerald-500' },
          { label: 'Failover On', value: '3 / 3',             icon: ShieldCheck, color: 'text-[var(--status-active)]' },
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

      {/* Routing Sections */}
      <div className="flex flex-col gap-6">
        {(['llm', 'stt', 'tts'] as ProviderType[]).map((type) => (
          <RoutingSection
            key={type}
            type={type}
            chain={config[type]}
            providers={providerMap[type]}
            onUpdate={(patch) => updateChain(type, patch)}
            onToggleCondition={(c) => toggleCondition(type, c)}
          />
        ))}
      </div>
    </div>
  )
}

function RoutingSection({
  type, chain, providers, onUpdate, onToggleCondition,
}: {
  type: ProviderType
  chain: RoutingChain
  providers: typeof llmProviders | typeof sttProviders | typeof ttsProviders
  onUpdate: (patch: Partial<RoutingChain>) => void
  onToggleCondition: (c: string) => void
}) {
  const meta = sectionMeta[type]
  const Icon = meta.icon

  function providerName(id: string) {
    return (providers as { id: string; name: string }[]).find((p) => p.id === id)?.name ?? id
  }

  function providerLogo(id: string) {
    return (providers as { id: string; logo: string }[]).find((p) => p.id === id)?.logo ?? '?'
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Section header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-md bg-muted')}>
          <Icon className={cn('h-4 w-4', meta.color)} />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{meta.label} Routing</h2>
          <p className="text-xs text-muted-foreground">Priority chain and failover configuration</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Failover</span>
          <Switch
            checked={chain.strategy === 'failover' || chain.strategy === 'priority'}
            onCheckedChange={(v) => onUpdate({ strategy: v ? 'failover' : 'round-robin' })}
          />
        </div>
      </div>

      <div className="p-5 flex gap-8">
        {/* Visual chain */}
        <div className="flex flex-col items-center gap-1 min-w-[180px]">
          <ChainNode
            rank="Primary"
            logo={providerLogo(chain.primary)}
            name={providerName(chain.primary)}
            color="border-[var(--status-active)]/40 bg-[var(--status-active)]/5"
            labelColor="text-[var(--status-active)]"
          />
          <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
          <ChainNode
            rank="Fallback"
            logo={providerLogo(chain.fallback)}
            name={providerName(chain.fallback)}
            color="border-[var(--status-warning)]/40 bg-[var(--status-warning)]/5"
            labelColor="text-[var(--status-warning)]"
          />
          <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
          <ChainNode
            rank="Secondary Fallback"
            logo={providerLogo(chain.secondaryFallback)}
            name={providerName(chain.secondaryFallback)}
            color="border-border bg-muted/30"
            labelColor="text-muted-foreground"
          />
        </div>

        <Separator orientation="vertical" className="h-auto" />

        {/* Config */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Provider selects */}
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'primary' as const,           label: 'Primary' },
              { key: 'fallback' as const,           label: 'Fallback' },
              { key: 'secondaryFallback' as const,  label: 'Secondary Fallback' },
            ]).map((item) => (
              <div key={item.key} className="flex flex-col gap-1.5">
                <Label className="text-xs">{item.label}</Label>
                <Select
                  value={chain[item.key]}
                  onValueChange={(v) => v && onUpdate({ [item.key]: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(providers as { id: string; name: string; logo: string }[]).map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.logo} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Separator />

          {/* Strategy & timing */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Strategy</Label>
              <Select
                value={chain.strategy}
                onValueChange={(v) => v && onUpdate({ strategy: v as RoutingChain['strategy'] })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="failover">Failover</SelectItem>
                  <SelectItem value="priority">Priority-Based</SelectItem>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Timeout (ms)</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={chain.timeoutMs}
                onChange={(e) => onUpdate({ timeoutMs: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Retry Count</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={chain.retryCount}
                onChange={(e) => onUpdate({ retryCount: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <Separator />

          {/* Failure conditions */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Trigger Failover On</Label>
            <div className="flex flex-wrap gap-2">
              {FAILURE_CONDITIONS.map((fc) => {
                const active = chain.failureConditions.includes(fc.key)
                return (
                  <button
                    key={fc.key}
                    onClick={() => onToggleCondition(fc.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                      active
                        ? 'border-destructive/40 bg-destructive/5 text-destructive'
                        : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
                    )}
                  >
                    {active && <AlertTriangle className="h-2.5 w-2.5" />}
                    {fc.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChainNode({
  rank, logo, name, color, labelColor,
}: {
  rank: string
  logo: string
  name: string
  color: string
  labelColor: string
}) {
  return (
    <div className={cn('w-full rounded-lg border px-3 py-2.5 flex items-center gap-2.5', color)}>
      <span className="text-base">{logo}</span>
      <div className="min-w-0">
        <p className={cn('text-[10px] font-semibold uppercase tracking-wider', labelColor)}>{rank}</p>
        <p className="text-xs font-medium truncate">{name}</p>
      </div>
    </div>
  )
}
