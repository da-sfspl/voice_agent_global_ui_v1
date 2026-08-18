'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type Agent } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  Rocket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GitBranch,
  Server,
  Phone,
  Globe,
  Clock,
  ShieldCheck,
} from 'lucide-react'

type CheckStatus = 'pass' | 'fail' | 'warning'

const checks: { label: string; detail: string; status: CheckStatus }[] = [
  { label: 'System prompt configured', detail: 'System prompt is set and contains 198 tokens.', status: 'pass' },
  { label: 'LLM provider connected', detail: 'OpenAI gpt-4o is active and responding.', status: 'pass' },
  { label: 'STT provider connected', detail: 'Deepgram Nova-3 is active.', status: 'pass' },
  { label: 'TTS provider connected', detail: 'ElevenLabs Rachel voice is active.', status: 'pass' },
  { label: 'Knowledge base ready', detail: '2 knowledge base(s) are in ready state.', status: 'pass' },
  { label: 'Guardrails configured', detail: 'PII blocking and profanity filter are enabled.', status: 'pass' },
  { label: 'Phone number assigned', detail: 'No phone number is assigned to this agent.', status: 'warning' },
  { label: 'Voice tested', detail: 'No test call recorded for this version.', status: 'warning' },
]

const checkIcon: Record<CheckStatus, React.ElementType> = {
  pass: CheckCircle2,
  fail: XCircle,
  warning: AlertTriangle,
}

const checkColor: Record<CheckStatus, string> = {
  pass: 'text-[var(--status-active)]',
  fail: 'text-destructive',
  warning: 'text-[var(--status-warning)]',
}

export function PublishAgent({ agent }: { agent: Agent }) {
  const [env, setEnv] = useState<'production' | 'staging'>('staging')
  const passCount = checks.filter((c) => c.status === 'pass').length
  const warnCount = checks.filter((c) => c.status === 'warning').length
  const failCount = checks.filter((c) => c.status === 'fail').length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" render={<Link href={`/agents/${agent.id}/config`} />} nativeButton={false} className="h-8 px-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Configure
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-xl font-semibold">Publish Agent</h1>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Main */}
        <div className="flex flex-col gap-4">
          {/* Pre-publish Checks */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Pre-publish Checks</h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-[var(--status-active)]"><CheckCircle2 className="h-4 w-4" />{passCount} passed</span>
                {warnCount > 0 && <span className="flex items-center gap-1 text-[var(--status-warning)]"><AlertTriangle className="h-4 w-4" />{warnCount} warnings</span>}
                {failCount > 0 && <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" />{failCount} failed</span>}
              </div>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {checks.map((c) => {
                const Icon = checkIcon[c.status]
                return (
                  <div key={c.label} className="flex items-start gap-3 py-3">
                    <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', checkColor[c.status])} />
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Deployment Config */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold mb-4">Deployment Configuration</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Deployment Environment</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['staging', 'production'] as const).map((e) => (
                    <button
                      key={e}
                      onClick={() => setEnv(e)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                        env === e ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80',
                      )}
                    >
                      <Server className={cn('h-5 w-5', env === e ? 'text-primary' : 'text-muted-foreground')} />
                      <div>
                        <p className="text-sm font-medium capitalize">{e}</p>
                        <p className="text-xs text-muted-foreground">
                          {e === 'staging' ? 'Test environment — no live traffic' : 'Live environment — receives real calls'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Phone Number Assignment</Label>
                <Select defaultValue="none">
                  <SelectTrigger><SelectValue placeholder="Select a number" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not assigned</SelectItem>
                    <SelectItem value="+1-800-555-0192">+1 (800) 555-0192 — Main Support</SelectItem>
                    <SelectItem value="+1-888-555-0144">+1 (888) 555-0144 — Sales</SelectItem>
                    <SelectItem value="+1-866-555-0177">+1 (866) 555-0177 — Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>SIP Endpoint (optional)</Label>
                <Input placeholder="sip:agent@your-pbx.example.com" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Version Label</Label>
                <Input defaultValue={`v${agent.version}`} placeholder="e.g. v3.2.1" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Release Notes</Label>
                <Textarea rows={3} placeholder="Describe what changed in this version..." />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Deployment Summary</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <SummaryRow label="Agent" value={agent.name} />
              <SummaryRow label="Version" value={`v${agent.version}`} mono />
              <SummaryRow label="Environment" value={env} />
              <SummaryRow label="LLM" value={`${agent.llmProvider} / ${agent.llmModel}`} />
              <SummaryRow label="STT" value={agent.sttProvider} />
              <SummaryRow label="TTS" value={`${agent.ttsProvider} / ${agent.voice}`} />
            </div>
            <Separator className="my-3" />
            <div className="flex flex-col gap-2">
              <Button className="w-full gap-2" disabled={failCount > 0}>
                <Rocket className="h-4 w-4" />
                Publish to {env.charAt(0).toUpperCase() + env.slice(1)}
              </Button>
              <Button variant="outline" className="w-full" render={<Link href={`/agents/${agent.id}/config`} />} nativeButton={false} >
                Back to Configure
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Deployment History</h3>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>v3.2.1 deployed Aug 1, 2026 — Production</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>v3.1.0 deployed Jul 10, 2026 — Production</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>v3.0.2 deployed Jun 15, 2026 — Production</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Compliance</h3>
            <div className="flex flex-col gap-2">
              {[
                { icon: ShieldCheck, label: 'PII Guardrails Active', ok: true },
                { icon: Globe, label: 'GDPR Compliant Region', ok: true },
                { icon: Phone, label: 'TCPA Notice Configured', ok: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <item.icon className={cn('h-3.5 w-3.5 shrink-0', item.ok ? 'text-[var(--status-active)]' : 'text-[var(--status-warning)]')} />
                  <span className={item.ok ? 'text-foreground' : 'text-[var(--status-warning)]'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn('font-medium text-right truncate', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}
